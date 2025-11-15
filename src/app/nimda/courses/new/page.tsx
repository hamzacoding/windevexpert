'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import CourseModal from '@/components/admin/CourseModal'

export default function NewCoursePage() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  const handleClose = () => {
    setIsOpen(false)
    router.push('/nimda/courses')
  }

  const handleSave = () => {
    router.push('/nimda/courses')
  }

  return (
    <div className="p-6">
      <CourseModal
        isOpen={isOpen}
        onClose={handleClose}
        onSave={handleSave}
        course={null}
      />
    </div>
  )
}