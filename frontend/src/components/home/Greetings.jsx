import React, {useState, useEffect} from 'react'
import { formatDate, formatTime, getAvatarName } from '../../utils';

const Greetings = () => {
    const [dateTime, setDateTime] = useState(new Date())
    useEffect(() => {
        const timer = setInterval(() =>
            setDateTime(new Date()), 1000);

        return (() => clearInterval(timer));
    }, []);

     

    return (
        <div className='flex justify-between items-center mt-5 px-8
        '>
            <div className=''>
                <h1 className='text-[#f5f5f5] font-semibold text-2xl 
                                tracking-wide'>Xin chào, {getAvatarName()}</h1>
                <p className='text-[#ababab] text-sm'>
                    Hãy cung cấp dịch vụ tốt nhất cho khách hàng của bạn 😄.
                </p>
            </div>
            <div>
                <h1 className='text-[#f5f5f5] font-semibold text-2xl 
                                tracking-wide'>{formatTime(dateTime)}</h1>
                <p className='text-[#ababab] text-sm'>
                                {formatDate(dateTime)}</p>
            </div>
        </div>
    )
}

export default Greetings