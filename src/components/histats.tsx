import Script from "next/script"

export default function Histats() {
  const id = process.env.NEXT_PUBLIC_HISTATS_ID
  if (!id) return null

  return (
    <>
      <Script id="histats-config" strategy="afterInteractive">
        {`var _Hasync=_Hasync||[];_Hasync.push(['Histats.start','1,${id},4,0,0,0,00010000']);_Hasync.push(['Histats.fasi','1']);_Hasync.push(['Histats.track_hits','']);`}
      </Script>
      <Script
        src="https://s10.histats.com/js15_as.js"
        strategy="afterInteractive"
        async
      />
      <noscript>
        <a href="/" target="_blank" rel="noreferrer">
          <img
            src={`https://sstatic1.histats.com/0.gif?${id}&101`}
            alt="Histats"
            width="1"
            height="1"
            style={{ border: 0 }}
          />
        </a>
      </noscript>
    </>
  )
}

