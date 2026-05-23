import { useEffect, useRef, useState } from 'react'
import type { MessageAttachment } from '../../api/messages'
import { resolveAttachment } from '../../utils/attachmentCache'

type MessageAttachmentItemProps = {
  messageId: string
  attachment: MessageAttachment
  index: number
  isMine: boolean
}

export function MessageAttachmentItem({
  messageId,
  attachment,
  index,
  isMine,
}: MessageAttachmentItemProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [url, setUrl] = useState(attachment.url ?? '')
  const [isVisible, setIsVisible] = useState(Boolean(attachment.url))
  const [isLoading, setIsLoading] = useState(!attachment.url)
  const [hasError, setHasError] = useState(false)
  const isImage = attachment.type?.startsWith('image/') === true

  useEffect(() => {
    if (attachment.url) {
      setUrl(attachment.url)
      setIsVisible(true)
      setIsLoading(false)
      setHasError(false)
    }
  }, [attachment.url])

  useEffect(() => {
    if (attachment.url) {
      return
    }

    const element = containerRef.current

    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '240px' },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [attachment.url, messageId, index])

  useEffect(() => {
    if (!isVisible) {
      return
    }

    let cancelled = false

    async function load() {
      if (attachment.url) {
        setUrl(attachment.url)
        setIsLoading(false)
        setHasError(false)
        return
      }

      setIsLoading(true)
      setHasError(false)

      try {
        const loaded = await resolveAttachment(messageId, index, attachment)

        if (cancelled) return

        setUrl(loaded.url ?? '')
      } catch {
        if (cancelled) return
        setHasError(true)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [attachment, index, isVisible, messageId])

  if (!isVisible || isLoading) {
    return (
      <div
        ref={containerRef}
        aria-label={`Завантаження ${attachment.name}`}
        className={`animate-pulse rounded-lg ${
          isImage ? 'h-40 w-full max-w-xs' : 'h-8 w-40'
        } ${isMine ? 'bg-white/20' : 'bg-gray-200'}`}
      />
    )
  }

  if (hasError || !url) {
    return (
      <div ref={containerRef}>
        <p className={`text-xs ${isMine ? 'opacity-80' : 'text-gray-500'}`}>
          {attachment.name}
        </p>
      </div>
    )
  }

  if (isImage) {
    return (
      <div ref={containerRef}>
        <img
          src={url}
          alt={attachment.name}
          className="max-h-60 rounded-lg object-cover"
        />
      </div>
    )
  }

  return (
    <div ref={containerRef}>
      <a href={url} download={attachment.name} className="text-sm underline">
        {attachment.name}
      </a>
    </div>
  )
}
