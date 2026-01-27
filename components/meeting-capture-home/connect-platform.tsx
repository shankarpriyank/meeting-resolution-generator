'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

interface Platform {
  name: string;
  icon: string;
  iconAlt: string;
}

const platforms: Platform[] = [
  {
    name: 'Zoom',
    icon: '/video.svg',
    iconAlt: 'Zoom',
  },
  {
    name: 'Microsoft Teams',
    icon: '/windows.svg',
    iconAlt: 'Microsoft Teams',
  },
  {
    name: 'Google Meet',
    icon: '/google.svg',
    iconAlt: 'Google Meet',
  },
];

export function ConnectPlatform() {
  const handleConnect = (platformName: string) => {
    console.log(`Connecting to ${platformName}...`);
    // Add OAuth connection logic here
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">Connect Platform</h2>
      
      <div className="space-y-4">
        {platforms.map((platform) => (
            <Card className="flex flex-row justify-between items-center p-6 bg-[#0A0A0A] border border-[#2A2A2A] rounded-md" key={platform.name}>
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <Image
                  src={platform.icon}
                  alt={platform.iconAlt}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-base">
                  {platform.name}
                </span>
                <span className="text-[#A0A0A0] text-sm">
                  Connect via OAuth
                </span>
              </div>
            </div>
            
            <Button
              onClick={() => handleConnect(platform.name)}
              className="cursor-pointer bg-[#424242] hover:bg-[#525252] text-white border-0 rounded-sm px-4 py-2"
            >
              Connect
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
