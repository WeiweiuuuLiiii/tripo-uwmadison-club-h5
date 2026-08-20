const QR_SRC = `${import.meta.env.BASE_URL}qr-host-wechat.jpg`

/**
 * The contact QR. Deliberately a plain semantic <img> layered ABOVE the canvas
 * with a white border — never a WebGL texture, never an overlay-covered element —
 * so WeChat long-press recognition always works. Shared by both modes.
 */
export function ContactQR() {
  return (
    <div className="qr-block">
      <div className="qr-title">联系人微信</div>
      <div className="qr-frame">
        <div className="qr-card">
          <img
            src={QR_SRC}
            width={888}
            height={1131}
            alt="联系人微信二维码，长按识别添加"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <p className="qr-line">长按识别二维码，添加联系人</p>
      <p className="qr-note">
        添加时请备注：<b>姓名＋专业＋年级＋TRIPO</b>
      </p>
      <p className="qr-note">想进入核心项目组的同学，可以同时注明感兴趣的方向。</p>
      <p className="qr-remark">请长按二维码识别</p>
    </div>
  )
}
