import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReveal, useCountUp } from './hooks/useReveal'

const QR_SRC = `${import.meta.env.BASE_URL}qr-host-wechat.jpg`

/* ---------- small building blocks ---------- */

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const { ref, shown } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal${shown ? ' in' : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

function CountStat({ to, suffix, label }: { to: number; suffix: string; label: string }) {
  const { ref, value } = useCountUp(to)
  return (
    <div className="stat">
      <div className="num grad-text">
        <span ref={ref}>{value}</span>
        {suffix}
      </div>
      <div className="lbl">{label}</div>
    </div>
  )
}

function BrandMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M32 12 L50 22 L50 42 L32 52 L14 42 L14 22 Z" />
        <path d="M32 12 L32 32 M32 32 L50 22 M32 32 L14 22 M32 32 L32 52" />
      </g>
    </svg>
  )
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ---------- page ---------- */

export default function App() {
  const [ctaHidden, setCtaHidden] = useState(false)
  const joinRef = useRef<HTMLElement | null>(null)

  // Fade the fixed CTA out once the QR / join section is on screen so it never
  // covers the QR code.
  useEffect(() => {
    const el = joinRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => setCtaHidden(entries[0].isIntersecting),
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="app">
      {/* ============ 1 · HERO ============ */}
      <header className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-glow" />
          <div className="hero-grid" />
          <div className="cube-stage">
            <div className="cube">
              <div className="face f1" />
              <div className="face f2" />
              <div className="face f3" />
              <div className="face f4" />
              <div className="face f5" />
              <div className="face f6" />
            </div>
          </div>
        </div>

        <div className="wrap">
          <div className="hero-kicker">
            UW–MADISON <b>×</b> TRIPO
          </div>
          <h1 className="hero-title">
            从一句话，
            <br />
            到一个<span className="grad-text">三维世界</span>
          </h1>
          <div className="hero-sub">TRIPO AI 3D 社团｜2026 秋季招新</div>
          <p className="hero-body">
            当大多数人还在用 AI 生成图片，我们已经开始生成角色、资产、空间和真正可以运行的三维世界。
          </p>
          <p className="hero-body">
            这里不是来听几场讲座、领一个社团头衔。你会进入项目、加入团队、完成 Demo，并把作品展示给真正从事
            AI 3D 的公司、开发者和创作者。
          </p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => scrollToId('join')}>
              加入 2026 秋季招新
            </button>
            <button className="btn btn-ghost" onClick={() => scrollToId('what')}>
              看看我们要做什么
            </button>
          </div>
        </div>

        <div className="scroll-hint" aria-hidden="true">
          SCROLL TO CREATE
          <div className="bar" />
        </div>
      </header>

      <main>
      {/* ============ 2 · COMPANY ============ */}
      <section className="section" id="about">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">01 / COMPANY</span>
            <h2 className="h-title">认识 TRIPO：让每个人都能创造三维世界</h2>
            <p className="lead">
              TRIPO 是由 VAST 打造的 AI 原生三维创作平台。通过文字或图片，创作者可以快速生成可继续编辑和使用的
              3D 模型，并将资产接入 Blender、Unity、Unreal、Godot 等创作和开发流程。
            </p>
            <p className="lead">
              从游戏角色、虚拟空间和产品原型，到 XR、动画、工业设计与 3D 打印，AI 正在重新定义三维内容的生产方式。
            </p>
            <p className="pull grad-text">过去需要专业团队数天完成的原型，现在可以从一句 Prompt 开始。</p>
          </Reveal>
          <Reveal delay={80}>
            <div className="stats">
              <CountStat to={20} suffix="M+" label="全球创作者" />
              <CountStat to={200} suffix="M+" label="AI 生成 3D 模型" />
              <div className="stat">
                <div className="num grad-text">Sony×VAST</div>
                <div className="lbl">官方 3D 业务合作</div>
              </div>
            </div>
            <span className="mono-note" style={{ marginTop: 12, display: 'block' }}>
              数据来源：tripo3d.ai 官方页面（20M+ 创作者 · 已生成 200M 3D 模型）
            </span>
          </Reveal>
        </div>
      </section>

      {/* ============ 3 · WHY NOW ============ */}
      <section className="section" id="why">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">02 / WHY NOW</span>
            <h2 className="h-title">AI 改变了图片，下一步就是整个三维世界</h2>
            <p className="lead">
              游戏里的角色、VR 中的空间、电影里的资产、数字人、产品原型和虚拟世界，都离不开 3D 内容。
            </p>
            <p className="lead">
              过去，三维创作的门槛是建模经验、时间和成本。现在，AI 正在重新定义从创意到资产、从资产到交互体验的完整流程。
            </p>
          </Reveal>
          <Reveal delay={60}>
            <div className="statement">
              <p>
                当别人还停留在 Prompt 出图，你已经可以把 Prompt 变成一个<span className="grad-text">可交互世界</span>。
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 4 · CLUB ============ */}
      <section className="section" id="what">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">03 / THE CLUB</span>
            <h2 className="h-title">不是“每月听一次讲座”，而是一支真正做项目的团队</h2>
          </Reveal>
          <Reveal delay={60}>
            <div className="cards two">
              <div className="card">
                <span className="tag">OPEN COMMUNITY</span>
                <h3>开放社区</h3>
                <ul className="list">
                  <li>每月工作坊</li>
                  <li>TRIPO 实操体验</li>
                  <li>官方课程和挑战</li>
                  <li>创意分享</li>
                  <li>比赛与展示</li>
                  <li>零基础入门</li>
                </ul>
              </div>
              <div className="card accent">
                <span className="tag">CORE PROJECT TEAM</span>
                <h3>核心项目组</h3>
                <ul className="list">
                  <li>自主提出项目创意</li>
                  <li>组建技术与创意团队</li>
                  <li>制定 MVP 和开发周期</li>
                  <li>使用 GitHub 或项目管理工具协作</li>
                  <li>定期 Sprint 和 Demo Review</li>
                  <li>完成可以公开演示的作品</li>
                </ul>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <p className="pull">我们不要求每个人已经很厉害，但希望你愿意真的把东西做出来。</p>
            <div className="note-block">
              该社团由 TRIPO 校园主理人发起。项目方向、技术栈、团队结构和最终成果由学生团队高度自主决定。
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 5 · HANDS-ON EXPERIENCE ============ */}
      <section className="section" id="experience">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">04 / HANDS-ON</span>
            <h2 className="h-title">从 Prompt 到可运行 Demo，亲手走完一条完整开发链</h2>
          </Reveal>
          <Reveal delay={60}>
            <div className="flow">
              {[
                '文字或图片创意',
                'TRIPO 生成 3D 角色与资产',
                'Blender 优化模型、材质和拓扑',
                '导入 Unity 或 Unreal',
                '添加动画、交互与游戏逻辑',
                '测试、迭代并完成 Demo',
                '公开演讲与项目展示',
              ].map((t, i) => (
                <div className={`step${i === 1 ? ' hot' : ''}`} key={i}>
                  <div className="dot">{i + 1}</div>
                  <div className="st-h">{t}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={70}>
            <div
              className="note-block"
              style={{ borderLeftColor: 'var(--blue)', background: 'rgba(19,56,255,0.08)' }}
            >
              第一期方向：<b style={{ color: 'var(--ink)' }}>用 AI 生成一个世界，再让它真正运行起来。</b>
            </div>
            <div className="mini-grid">
              {[
                'AI 3D 小游戏',
                '可交互虚拟场景',
                'AI 生成角色与动画',
                'XR / VR 体验',
                '数字校园',
                '3D 创意工具',
                '3D 打印 / 产品原型',
                '成员自主提出的原创项目',
              ].map((t, i) => (
                <div className="mini" key={i}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {t}
                </div>
              ))}
            </div>
            <p className="lead" style={{ marginTop: 18 }}>
              我们不是只学一个软件，而是完成一件真正能够运行、展示和进入作品集的作品。
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ 6 · SEMESTER ROADMAP ============ */}
      <section className="section" id="roadmap">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">05 / ROADMAP</span>
            <h2 className="h-title">你的一个学期，将从第一次生成走向最终舞台</h2>
          </Reveal>
          <Reveal delay={60}>
            <div className="flow">
              {[
                ['ONBOARDING', '熟悉 TRIPO、AI 3D 工作流和基础工具。'],
                ['IDEA PITCH', '提出项目创意，找到方向相同的队友。'],
                ['TEAM FORMATION', '组建开发、3D、产品、设计和内容团队。'],
                ['BUILD SPRINT', '按照短周期 Sprint 开发、测试和迭代。'],
                ['MONTHLY DEMO', '展示进度、接受反馈、解决技术问题。'],
                ['FINAL DEMO DAY', '发布作品，完成演讲、项目视频和作品集材料。'],
              ].map(([k, d], i) => (
                <div className={`step${i === 5 ? ' hot' : ''}`} key={i}>
                  <div className="dot">{i + 1}</div>
                  <div className="st-k">{k}</div>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={70}>
            <p className="pull grad-text">
              加入时你带来的可能只是一个想法，离开时你应该带走一件真正可以展示的作品。
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ 7 · MEMBER RESOURCES ============ */}
      <section className="section" id="resources">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">06 / RESOURCES</span>
            <h2 className="h-title">我们提供的不只是活动，而是把创意推向现实的资源</h2>
          </Reveal>
          <Reveal delay={60}>
            <div className="card">
              <ul className="list">
                <li>每位成员初始约 3600 TRIPO Credits</li>
                <li>项目需要时可申请追加生成额度</li>
                <li>TRIPO 官方课程和技术内容</li>
                <li>官方活动、创意挑战及比赛机会</li>
                <li>技术问题支持和开发反馈</li>
                <li>优秀大型项目可提交资源、经费或技术支持申请</li>
                <li>项目通过内部评估后，有机会获得进一步资源</li>
                <li>根据项目需求，有机会连接 Unity 等相关技术生态和合作资源</li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={70}>
            <p className="pull">公司不会替学生完成项目，但会帮助真正有执行力的团队走得更远。</p>
          </Reveal>
        </div>
      </section>

      {/* ============ 8 · INTERNSHIP & CAREER ============ */}
      <section className="section" id="career">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">07 / OPPORTUNITY</span>
            <h2 className="h-title">最值钱的，不只是简历上的一个 Club 名字</h2>
            <p className="lead">在这里，项目就是你的申请材料，Demo 就是你的能力证明。</p>
          </Reveal>
          <Reveal delay={60}>
            <div className="card accent">
              <ul className="list">
                <li>优秀成员有机会进入 TRIPO/VAST 的实习、培训或项目筛选视野</li>
                <li>表现突出的成员有机会获得公司相关岗位和项目机会的优先关注</li>
                <li>根据岗位匹配和项目表现，有机会连接合作生态中的实习或项目机会</li>
                <li>项目负责人、核心开发者和优秀创作者可以形成更有说服力的作品及推荐材料</li>
                <li>与真正的 AI 3D 产品、技术和行业需求建立连接</li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={70}>
            <p className="pull">
              当别人还在简历上写“熟悉 Unity”“了解生成式 AI”，你已经可以直接打开一个能运行的
              Demo，讲清楚自己做了什么、解决了什么问题，以及它为什么有价值。
            </p>
            <div className="disclaimer">
              实习、培训、推荐及合作机会均需根据项目表现、岗位需求和相关公司筛选确定，不构成录用保证。
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 9 · DEMO & SHOWCASE ============ */}
      <section className="section" id="demo">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">08 / SHOWCASE</span>
            <h2 className="h-title">作品不是做完就结束，而是要被真正看见</h2>
          </Reveal>
          <Reveal delay={60}>
            <div className="card">
              <ul className="list">
                <li>每月项目 Demo Review</li>
                <li>成员介绍产品、技术路线和开发过程</li>
                <li>优秀项目有机会进入官方内容或展示渠道</li>
                <li>优秀团队有机会参与公司开发者分享或项目演讲</li>
                <li>有机会参加跨校园活动、比赛和公开展示</li>
                <li>项目可以整理成 Demo、GitHub、技术文章、项目视频和完整 Case Study</li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={70}>
            <p className="pull">
              你不仅要学会把产品做出来，还要学会站在台上，让别人理解它、记住它，并愿意为它提供下一步机会。
            </p>
            <button className="jumplink" onClick={() => scrollToId('join')}>
              想了解核心项目组？联系主理人 <span className="arrow">→</span>
            </button>
          </Reveal>
        </div>
      </section>

      {/* ============ 10 · WHO + QR (JOIN) ============ */}
      <section className="section qr-section" id="join" ref={joinRef}>
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">09 / JOIN US</span>
            <h2 className="h-title">AI 3D 不只属于程序员</h2>
            <div className="chips">
              {[
                'Unity / Unreal / 游戏开发',
                'Python / AI / 后端与工具开发',
                'Blender / 3D 建模 / 动画',
                'UI/UX / 视觉设计',
                '产品经理 / 项目管理',
                '建筑 / 艺术 / 工业设计',
                '内容运营 / 摄影 / 视频制作',
                '对 AI 3D 感兴趣的零基础成员',
              ].map((t, i) => (
                <span className={`chip${i % 3 === 0 ? ' blue' : i % 3 === 1 ? ' orange' : ''}`} key={i}>
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="statement" style={{ marginTop: 30 }}>
              <p>
                下一批 AI 3D 作品，不应该只是被你刷到。
                <br />
                它们可以由你<span className="grad-text">亲手做出来</span>。
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="qr-title">主理人微信</div>
            <div className="qr-card">
              <img
                src={QR_SRC}
                width={888}
                height={1131}
                alt="主理人微信二维码，长按识别添加"
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="qr-line">长按识别二维码，添加主理人</p>
            <p className="qr-note">
              添加时请备注：<b>姓名＋专业＋年级＋TRIPO</b>
            </p>
            <p className="qr-note">想进入核心项目组的同学，可以同时注明感兴趣的方向。</p>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={() => scrollToId('join')}>
                加入 TRIPO AI 3D Club
              </button>
            </div>
            <p className="qr-remark">请长按二维码识别</p>
          </Reveal>
        </div>
      </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="foot">
        <div className="wrap">
          <div>UW–Madison TRIPO AI 3D Club · 2026 Fall Recruitment</div>
          <p className="fine">具体活动安排、资源支持及机会以项目实际进展和相关方审核为准。</p>
        </div>
      </footer>

      {/* ============ FIXED BOTTOM CTA ============ */}
      <div
        className={`cta-bar${ctaHidden ? ' hidden' : ''}`}
        role="region"
        aria-label="加入 TRIPO AI 3D Club"
      >
        <div className="cta-brand">
          <span className="mk">
            <BrandMark />
          </span>
          <span className="tx">TRIPO AI 3D</span>
        </div>
        <button className="btn btn-primary" onClick={() => scrollToId('join')}>
          立即加入
        </button>
      </div>
    </div>
  )
}
