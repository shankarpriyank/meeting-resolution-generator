import React from 'react'
import { Bell, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MeetingCaptureHomeNavbar = () => {
  return (
    <div className="bg-[#1a1a1a] dark:bg-[#0f0f0f] border-b border-gray-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-[#E5E5E5] dark:text-[#E5E5E5]">
            Meeting Capture Dashboard
          </h1>
          <p className="text-sm text-[#8A8A8A] dark:text-[#8A8A8A] mt-0.5">
            Upload recordings or connect live platforms
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#8A8A8A] dark:text-[#8A8A8A] cursor-pointer hover:text-gray-200 transition-colors">
            <Bell className="w-5 h-5 text-[#8A8A8A]" />
            <span className="text-sm">Notifications</span>
          </div>

          <Button
            className="cursor-pointer bg-white text-gray-900 hover:bg-gray-100 rounded-sm px-6 py-5 font-medium"
            variant="default"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Meeting
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MeetingCaptureHomeNavbar