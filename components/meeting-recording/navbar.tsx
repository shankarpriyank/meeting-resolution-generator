
const MeetingRecordingNavbar = () => {
  return (
    <div className="bg-[#0A0A0A] dark:bg-[#0f0f0f] border-b border-gray-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-[#E5E5E5] dark:text-[#E5E5E5]">
          Board Meeting Recording
          </h1>
          <p className="text-sm text-[#8A8A8A] dark:text-[#8A8A8A] mt-0.5">
          Playback and analyze meeting audio
          </p>
        </div>
      </div>
    </div>
  )
}

export default MeetingRecordingNavbar