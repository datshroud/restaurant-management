import React, {useState, useEffect} from 'react'

const Greetings = () => {
    const [dateTime, setDateTime] = useState(new Date())
    useEffect(() => {
        const timer = setInterval(() =>
            setDateTime(new Date()), 1000);

        return (() => clearInterval(timer));
    }, []);

    const formatTime = (date) => 
        `${String(date.getHours()).padStart(2, "0")}:
        ${String(date.getMinutes()).padStart(2, "0")}:
        ${String(date.getSeconds()).padStart(2, "0")}`;

    const formatDate = (date) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];
        return `${months[date.getMonth()]} 
                ${String(date.getDate()).padStart(2, "0")}, 
                ${String(date.getFullYear())}`
    };  

    return (
        <div className='flex justify-between items-center mt-5 px-8'>
            <div className=''>
                <h1 className='text-[#f5f5f5] font-semibold text-2xl 
                                tracking-wide'>Xin chào, Đạt Lê</h1>
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