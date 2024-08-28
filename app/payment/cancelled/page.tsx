import { Button } from '@mantine/core'
import { Card } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import Link from 'next/link'
import React from 'react'

function cancelledroute() {
  return (
    <div className='w-full min-h-[80vh] flex items-center justify-center'>
      <Card className='w-[350px]'>
        <div className='p-6'>
            <div className='w-full flex justify-center'>
                <IconX className='w-12 h-12 rounded-full bg-red-500/30 text-red-500 p-2'/>
            </div>
            <div className='mt-3 text-center sm:mt-5 w-full'>
                 <h3 className='text-lg leading-6 font-medium'>Payment failed</h3>
                  <div className='mt-2'>
                    <p className='text-sm text-muted-foreground'>
                        Payment didnt deducted . Please try again
                    </p>
                  </div>
                  
                  <div className='mt-5 sm:mt-6 w-full'>
                    <Button>
                        <Link href={"/"}>Go back to dashboard</Link>
                    </Button>
                  </div>
                  
            </div>
        </div>
      </Card>
    </div>
  )
}

export default cancelledroute