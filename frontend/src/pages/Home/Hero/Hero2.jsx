import React from 'react'
import bgImg from '../../../assets/home/banner-2.jpg'

export default function Hero2() {
  return (
    <div className='min-h-screen bg-cover' style={{backgroundImage: `url(${bgImg})`}}>
        <div className='min-h-screen flex justify-start pl-11 text-white bg-black bg-opacity-60'>
            <div>
                <div className='space-y-4'>
                    <p className='md:text-4xl text-2xl'>We are famous for providing</p>
                    <h1 className='md:text-7xl text-4xl font-bold'>Best Yoga Course</h1>
                    <div className='md:w-1/2'>
                        <p>
                            This is hero1This is hero1This is hero1This is hero1This is hero1
                            This is hero1This is hero1This is hero1
                        </p>
                    </div>
                    <div className='flex flex-wrap items-center gap-5'>
                        <button className='px-7 py-3 rounded-lg bg-secondary font-bold uppercase'>Join</button>
                        <button className='px-7 py-3 rounded-lg border hover:bg-secondary font-bold uppercase'>View Course</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
