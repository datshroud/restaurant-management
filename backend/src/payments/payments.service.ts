import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConnectionPool, Decimal, Int, NVarChar, Transaction } from 'mssql';
import { DATABASE_POOL } from '../db/db.module';
import { CreatePaymentDto } from './dto/create-payment.dto';
import crypto from 'crypto';
import axios from 'axios';
import { NotificationsService } from '../notifications/notifications.service';

type PaymentRow = {
    Id: number;
    OrderId: number;
    Method: string;
    Amount: number;
    PaidAt: Date;
};

type OrderAmountRow = {
    Id: number;
    Total: number;
};

@Injectable()
export class PaymentsService {
    constructor(
        @Inject(DATABASE_POOL) private readonly pool: ConnectionPool,
        private readonly notificationsService: NotificationsService,
    ) {}

    async getAll() {
        const res = await this.pool
            .request()
            .query<PaymentRow>('SELECT Id, OrderId, Method, Amount, PaidAt FROM Payments ORDER BY Id DESC');
        return res.recordset;
    }

    async getByOrderId(orderId: number) {
        const res = await this.pool
            .request()
            .input('OrderId', Int, orderId)
            .query<PaymentRow>(
                'SELECT Id, OrderId, Method, Amount, PaidAt FROM Payments WHERE OrderId = @OrderId ORDER BY Id DESC',
            );
        return res.recordset;
    }

    async create(data: CreatePaymentDto) {
        const paymentId = await this.finalizePayment(
            data.orderId,
            data.method,
            data.amount,
        );
        return { ok: true, id: paymentId };
    }

    async createMomoPayment(orderId: number) {
        const orderAmount = await this.getOrderAmount(orderId);
        const amount = Math.round(orderAmount);

        const partnerCode = process.env.MOMO_PARTNER_CODE ?? '';
        const accessKey = process.env.MOMO_ACCESS_KEY ?? '';
        const secretKey = process.env.MOMO_SECRET_KEY ?? '';
        const redirectUrl = process.env.MOMO_RETURN_URL ?? 'http://localhost:5173/payments/momo/return';
        const ipnUrl = process.env.MOMO_NOTIFY_URL ?? 'http://localhost:3000/api/payments/momo/ipn';
        const endpoint = process.env.MOMO_ENDPOINT ?? 'https://test-payment.momo.vn/v2/gateway/api/create';

        if (!partnerCode || !accessKey || !secretKey) {
            throw new BadRequestException('Thiếu cấu hình MoMo sandbox');
        }

        const orderInfo = `Thanh toán hóa đơn #${orderId}`;
        const requestId = `${orderId}-${Date.now()}`;
        const requestType = 'payWithMethod';
        const extraData = '';

        const rawSignature =
            `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
            `&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}` +
            `&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        const payload = {
            partnerCode,
            accessKey,
            requestId,
            amount: String(amount),
            orderId: String(orderId),
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'vi',
        };

        const response = await axios.post(endpoint, payload);
        return response.data;
    }

    async handleMomoNotification(payload: Record<string, string | number>) {
        const secretKey = process.env.MOMO_SECRET_KEY ?? '';
        const accessKey = process.env.MOMO_ACCESS_KEY ?? '';

        if (!secretKey || !accessKey) {
            throw new BadRequestException('Thiếu cấu hình MoMo sandbox');
        }

        const rawSignature =
            `accessKey=${accessKey}&amount=${payload.amount}&extraData=${payload.extraData ?? ''}` +
            `&message=${payload.message ?? ''}&orderId=${payload.orderId}` +
            `&orderInfo=${payload.orderInfo}&orderType=${payload.orderType ?? ''}` +
            `&partnerCode=${payload.partnerCode}&payType=${payload.payType ?? ''}` +
            `&requestId=${payload.requestId}&responseTime=${payload.responseTime}` +
            `&resultCode=${payload.resultCode}&transId=${payload.transId}`;

        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        if (signature !== payload.signature) {
            throw new BadRequestException('Chữ ký MoMo không hợp lệ');
        }

        if (String(payload.resultCode) === '0') {
            const orderId = Number(payload.orderId);
            const amount = Number(payload.amount);
            await this.finalizePayment(orderId, 'momo', amount);
        }

        return { ok: true };
    }

    async createVnpayPayment(orderId: number, ipAddr: string) {
        const orderAmount = await this.getOrderAmount(orderId);
        const amount = Math.round(orderAmount);

        const tmnCode = process.env.VNP_TMN_CODE ?? '';
        const hashSecret = process.env.VNP_HASH_SECRET ?? '';
        const vnpUrl = process.env.VNP_URL ?? 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const returnUrl = process.env.VNP_RETURN_URL ?? 'http://localhost:5173/payments/vnpay/return';

        if (!tmnCode || !hashSecret) {
            throw new BadRequestException('Thiếu cấu hình VNPay sandbox');
        }

        const createDate = this.formatVnpDate(new Date());
        const txnRef = `${orderId}-${Date.now()}`;

        const vnpParams: Record<string, string> = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Amount: String(amount * 100),
            vnp_CurrCode: 'VND',
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: `Thanh toan hoa don #${orderId}`,
            vnp_OrderType: 'other',
            vnp_Locale: 'vn',
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr || '127.0.0.1',
            vnp_CreateDate: createDate,
        };

        const signedQuery = this.signVnpParams(vnpParams, hashSecret);
        const paymentUrl = `${vnpUrl}?${signedQuery}`;
        return { paymentUrl };
    }

    async handleVnpayReturn(query: Record<string, string>) {
        const hashSecret = process.env.VNP_HASH_SECRET ?? '';
        if (!hashSecret) {
            throw new BadRequestException('Thiếu cấu hình VNPay sandbox');
        }

        const secureHash = query.vnp_SecureHash;
        const { vnp_SecureHash, vnp_SecureHashType, ...rest } = query;
        const signedQuery = this.signVnpParams(rest, hashSecret);
        const expectedHash = new URLSearchParams(signedQuery).get('vnp_SecureHash');

        if (!secureHash || secureHash !== expectedHash) {
            throw new BadRequestException('Chữ ký VNPay không hợp lệ');
        }

        if (query.vnp_ResponseCode === '00') {
            const orderId = Number((query.vnp_TxnRef || '').split('-')[0]);
            const amount = Number(query.vnp_Amount || 0) / 100;
            await this.finalizePayment(orderId, 'vnpay', amount);
        }

        return { ok: true };
    }

    private async getOrderAmount(orderId: number) {
        const res = await this.pool
            .request()
            .input('OrderId', Int, orderId)
            .query<OrderAmountRow>('SELECT Id, Total FROM Orders WHERE Id = @OrderId');

        if (res.recordset.length === 0) {
            throw new BadRequestException('Đơn hàng không tồn tại');
        }

        return Number(res.recordset[0].Total ?? 0);
    }

    private async finalizePayment(orderId: number, method: string, amount: number) {
        const tx = new Transaction(this.pool);
        await tx.begin();

        try {
            const orderRes = await tx
                .request()
                .input('OrderId', Int, orderId)
                .query<{ Id: number; TableId: number | null }>(
                    'SELECT Id, TableId FROM Orders WHERE Id = @OrderId',
                );

            if (orderRes.recordset.length === 0) {
                throw new BadRequestException('Đơn hàng không tồn tại');
            }

            let tableIds: number[] = [];
            try {
                const tablesRes = await tx
                    .request()
                    .input('OrderId', Int, orderId)
                    .query<{ TableId: number }>('SELECT TableId FROM OrderTables WHERE OrderId = @OrderId');
                tableIds = Array.from(
                    new Set(
                        tablesRes.recordset
                            .map((row) => Number(row.TableId))
                            .filter((id) => Number.isFinite(id) && id > 0),
                    ),
                );
            } catch {
                tableIds = [];
            }

            if (!tableIds.length) {
                const tableId = orderRes.recordset[0]?.TableId ?? null;
                if (tableId) {
                    tableIds = [tableId];
                }
            }

            const res = await tx
                .request()
                .input('OrderId', Int, orderId)
                .input('Method', NVarChar, method)
                .input('Amount', Decimal(18, 2), amount)
                .query(
                    'INSERT INTO Payments (OrderId, Method, Amount) OUTPUT INSERTED.Id VALUES (@OrderId, @Method, @Amount)',
                );

            await tx
                .request()
                .input('OrderId', Int, orderId)
                .input('Status', NVarChar, 'completed')
                .query('UPDATE Orders SET Status = @Status WHERE Id = @OrderId');

            if (tableIds.length) {
                const tableParams = tableIds.map((_, idx) => `@TableId${idx}`).join(', ');
                const tableReq = tx.request().input('Status', NVarChar, 'available');
                tableIds.forEach((id, idx) => {
                    tableReq.input(`TableId${idx}`, Int, id);
                });
                await tableReq.query(
                    `UPDATE DiningTables SET Status = @Status WHERE Id IN (${tableParams})`,
                );
            }

            await tx.commit();
            this.notificationsService.emit({
                id: `order-paid-${orderId}-${Date.now()}`,
                type: 'order_paid',
                orderId,
                total: amount,
                method,
                tableIds,
                createdAt: new Date().toISOString(),
            });
            return res.recordset[0]?.Id as number;
        } catch (error) {
            await tx.rollback();
            throw error;
        }
    }

    private signVnpParams(params: Record<string, string>, hashSecret: string) {
        const sortedKeys = Object.keys(params).sort();
        const sortedParams: Record<string, string> = {};
        sortedKeys.forEach((key) => {
            sortedParams[key] = params[key];
        });

        const query = new URLSearchParams(sortedParams).toString();
        const hmac = crypto.createHmac('sha512', hashSecret);
        const signed = hmac.update(query, 'utf-8').digest('hex');
        return `${query}&vnp_SecureHash=${signed}`;
    }

    private formatVnpDate(date: Date) {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return (
            date.getFullYear().toString() +
            pad(date.getMonth() + 1) +
            pad(date.getDate()) +
            pad(date.getHours()) +
            pad(date.getMinutes()) +
            pad(date.getSeconds())
        );
    }
}
