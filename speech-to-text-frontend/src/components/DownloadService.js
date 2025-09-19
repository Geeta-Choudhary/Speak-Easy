"use client"

import { useState } from "react"
import { Download, FileText, File, CheckCircle, Copy } from "lucide-react"

export default function DownloadService() {
  const [transcriptions, setTranscriptions] = useState([
    {
      id: 1,
      title: "Meeting Notes - Project Discussion",
      content:
        "This is a sample transcription from a project meeting. The team discussed the upcoming features and timeline for the speech-to-text application development.",
      date: "2024-01-15",
      duration: "15:30",
      type: "meeting",
    },
    {
      id: 2,
      title: "Interview Recording - User Feedback",
      content:
        "User interview transcription discussing the usability and features of the current speech-to-text system. Valuable insights for product improvement.",
      date: "2024-01-14",
      duration: "08:45",
      type: "interview",
    },
    {
      id: 3,
      title: "Hindi Audio Sample",
      content: "यह एक हिंदी भाषा का नमूना प्रतिलेखन है। इसमें विभिन्न विषयों पर चर्चा की गई है।",
      date: "2024-01-13",
      duration: "12:20",
      type: "hindi",
    },
  ])

  const [selectedTranscriptions, setSelectedTranscriptions] = useState([])
  const [downloadFormat, setDownloadFormat] = useState("txt")
  const [downloadStatus, setDownloadStatus] = useState("idle")

  const handleSelectTranscription = (id) => {
    setSelectedTranscriptions((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedTranscriptions.length === transcriptions.length) {
      setSelectedTranscriptions([])
    } else {
      setSelectedTranscriptions(transcriptions.map((t) => t.id))
    }
  }

  const downloadTranscription = (transcription, format) => {
    console.log(`[v0] Downloading transcription "${transcription.title}" as ${format.toUpperCase()}`)

    let content = ""
    let filename = ""
    let mimeType = ""

    switch (format) {
      case "txt":
        content = `${transcription.title}\nDate: ${transcription.date}\nDuration: ${transcription.duration}\n\n${transcription.content}`
        filename = `${transcription.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`
        mimeType = "text/plain"
        break
      case "docx":
        // Simulate DOCX content (in real app, would use a library like docx)
        content = transcription.content
        filename = `${transcription.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.docx`
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        break
      case "pdf":
        // Simulate PDF content (in real app, would use a library like jsPDF)
        content = transcription.content
        filename = `${transcription.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
        mimeType = "application/pdf"
        break
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadSelected = async () => {
    if (selectedTranscriptions.length === 0) return

    setDownloadStatus("downloading")
    console.log(`[v0] Downloading ${selectedTranscriptions.length} transcriptions as ${downloadFormat.toUpperCase()}`)

    // Simulate download processing
    for (let i = 0; i < selectedTranscriptions.length; i++) {
      const transcription = transcriptions.find((t) => t.id === selectedTranscriptions[i])
      if (transcription) {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate processing time
        downloadTranscription(transcription, downloadFormat)
      }
    }

    setDownloadStatus("completed")
    setTimeout(() => setDownloadStatus("idle"), 2000)
  }

  const copyToClipboard = (content) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        console.log("[v0] Transcription copied to clipboard")
      })
      .catch((err) => {
        console.log("[v0] Failed to copy to clipboard:", err)
      })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Download Service</h3>
        <p className="text-muted-foreground">Generate and download your transcription files in various formats</p>
      </div>

      {/* Download Format Selection */}
      <div className="bg-muted/50 rounded-lg p-4">
        <label className="block text-sm font-medium mb-3">Download Format:</label>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "txt", label: "TXT", icon: FileText },
            { value: "docx", label: "DOCX", icon: File },
            { value: "pdf", label: "PDF", icon: File },
          ].map((format) => {
            const Icon = format.icon
            return (
              <button
                key={format.value}
                onClick={() => setDownloadFormat(format.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  downloadFormat === format.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {format.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={handleSelectAll} className="text-sm text-primary hover:text-primary/80 underline">
              {selectedTranscriptions.length === transcriptions.length ? "Deselect All" : "Select All"}
            </button>
            <span className="text-sm text-muted-foreground">({selectedTranscriptions.length} selected)</span>
          </div>

          <button
            onClick={downloadSelected}
            disabled={selectedTranscriptions.length === 0 || downloadStatus === "downloading"}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloadStatus === "downloading"
              ? "Downloading..."
              : `Download Selected (${downloadFormat.toUpperCase()})`}
          </button>
        </div>

        {downloadStatus === "completed" && (
          <div className="flex items-center gap-2 text-green-500 text-sm">
            <CheckCircle className="w-4 h-4" />
            Download completed successfully!
          </div>
        )}
      </div>

      {/* Transcription List */}
      <div className="space-y-4">
        <h4 className="font-medium">Available Transcriptions:</h4>

        {transcriptions.map((transcription) => (
          <div key={transcription.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedTranscriptions.includes(transcription.id)}
                onChange={() => handleSelectTranscription(transcription.id)}
                className="mt-1 w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="font-medium text-foreground truncate">{transcription.title}</h5>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        transcription.type === "meeting"
                          ? "bg-blue-500/20 text-blue-400"
                          : transcription.type === "interview"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-orange-500/20 text-orange-400"
                      }`}
                    >
                      {transcription.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span>Date: {transcription.date}</span>
                  <span>Duration: {transcription.duration}</span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{transcription.content}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => downloadTranscription(transcription, "txt")}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 underline"
                  >
                    <Download className="w-3 h-3" />
                    TXT
                  </button>
                  <button
                    onClick={() => downloadTranscription(transcription, "docx")}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 underline"
                  >
                    <Download className="w-3 h-3" />
                    DOCX
                  </button>
                  <button
                    onClick={() => downloadTranscription(transcription, "pdf")}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 underline"
                  >
                    <Download className="w-3 h-3" />
                    PDF
                  </button>
                  <button
                    onClick={() => copyToClipboard(transcription.content)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Download Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-2">Download Options:</h4>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>
            • <strong>TXT:</strong> Plain text format, compatible with all text editors
          </li>
          <li>
            • <strong>DOCX:</strong> Microsoft Word format with formatting support
          </li>
          <li>
            • <strong>PDF:</strong> Portable document format for sharing and printing
          </li>
          <li>
            • <strong>Copy:</strong> Copy transcription text directly to clipboard
          </li>
        </ul>
      </div>
    </div>
  )
}
