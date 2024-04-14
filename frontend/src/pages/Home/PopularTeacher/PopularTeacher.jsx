import React, { useEffect, useState } from 'react'
import { Axios } from 'axios'
import useAxiosFetch from '../../../hooks/useAxiosFetch'
import img from '../../../assets/home/girl.jpg'

export default function PopularTeacher() {
    const [instructors, setInstructors] = useState([])
    const axiosFetch = useAxiosFetch()
    useEffect(() => {
        axiosFetch.get('/popular-instructors').then((data) => {
            setInstructors(data.data)
        }).catch((err) => {
            console.log(err)
        })
    }, [])

    console.log(instructors)
    return (
        <div className='md:w-[80%] mx-auto my-16'> 
            <div>
                <h1 className='text-5xl font-bold text-center'>Our <span className='text-secondary'>Best</span> Classes</h1>
                <div className='w-[40%] text-center mx-auto my-4'>
                    <p className='text-gray-500'>Explore popular classes.Explore popular classes.Explore popular classes.
    
                    </p>
                </div>
            </div>
                
                    {
                        instructors ? <>
                        <div>
                            {
                                instructors?.map((instructor, i) => (
                                    <div>
                                        <div>
                                            <img className='rounded-full border-4 border-gray-300 h-24 w-24 mx-auto' src={`instructor?.${img}`} alt=''></img>
                                            
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        </>:<></>
                    }
                
            
        </div>
      )
    }
