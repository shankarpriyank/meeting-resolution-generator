import React from 'react'
import ResolutionPreviewNavbar from './navbar'
import ResolutionPreviewContent from './content'
import ResolutionPreviewFooter from './footer'

const ResolutionPreview = () => {
  return (
    <div>
        <ResolutionPreviewNavbar />
        <ResolutionPreviewContent />
        <ResolutionPreviewFooter />
    </div>
  )
}

export default ResolutionPreview