import { ActiveMeetings } from "@/components/meeting-capture-home/meetings";
import MeetingCaptureHomeNavbar from "@/components/meeting-capture-home/navbar";

export default function Page() {
    return (
        <>
            <div className='sticky top-0 z-10'>
                <MeetingCaptureHomeNavbar />

            </div>
            <div className="bg-[#0a0a0a] mx-auto w-full min-h-screen p-6">
                <ActiveMeetings />
            </div>

        </>

    );
}