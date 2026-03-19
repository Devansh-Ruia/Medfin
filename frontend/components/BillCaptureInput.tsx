'use client'
// This component exists because <input type="file"> does not prompt the camera on mobile by default

import { useRef, useState } from 'react'
import { Camera, Upload } from 'lucide-react'

interface Props {
  onFileSelected: (file: File) => void
}

export default function BillCaptureInput({ onFileSelected }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    onFileSelected(file)
  }

  return (
    <div className="border border-dashed border-[#E5E2DC] bg-white p-8 text-center">
      {fileName ? (
        // Show selected file name instead of the upload UI -- the user has made their choice
        <p className="text-sm text-[#0D0D0D] font-medium">{fileName}</p>
      ) : (
        <>
          <p className="text-sm text-[#6B6B6B] mb-6">Upload a photo or scan of your medical bill</p>
          <div className="flex gap-3 justify-center">
            {/* capture="environment" opens the rear camera directly on mobile */}
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleChange}
            />
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex items-center gap-2 border border-[#E5E2DC] bg-white text-[#0D0D0D] text-sm px-5 py-3 rounded-none hover:bg-[#F9F8F6]"
            >
              <Camera size={16} />
              Scan Bill
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 bg-[#0D0D0D] text-white text-sm px-5 py-3 rounded-none"
            >
              <Upload size={16} />
              Upload File
            </button>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-4">PDF, PNG, JPG up to 10MB</p>
        </>
      )}
    </div>
  )
}
