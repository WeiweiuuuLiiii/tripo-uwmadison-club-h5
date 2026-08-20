import { type ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'
import { ContactQR } from './ContactQR'

/** Fade/rise a block in when it enters view (never leaves content invisible). */
function R({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const { ref, shown } = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`reveal${shown ? ' in' : ''}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}

function Zone({ id, tone, children }: { id: string; tone?: string; children: ReactNode }) {
  return (
    <section className={`zone${tone ? ` ${tone}` : ''}`} id={id}>
      <div className="ov-panel">{children}</div>
    </section>
  )
}

const scrollToJoin = () => document.getElementById('z07')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

export function Panels() {
  return (
    <>
      {/* 01 · PORTAL */}
      <Zone id="z01" tone="center">
        <R>
          <div className="ov-kicker">
            <span className="dot" /> UW–MADISON&nbsp;&nbsp;×&nbsp;&nbsp;TRIPO
          </div>
          <h1 className="ov-h1">
            从一句话，<br />
            到一个<span className="metal">三维世界</span>
          </h1>
          <p className="ov-lead-lg">滑动，进入 AI 3D 世界</p>
          <div className="ov-hint">
            <span className="bar" /> 向上滑动 · 穿过入口进入 TRIPO 世界
          </div>
        </R>
      </Zone>

      {/* 02 · GENERATION CORE */}
      <Zone id="z02">
        <R>
          <span className="eyebrow">GENERATION CORE · 生成核心</span>
          <h2 className="ov-h2">看一句 Prompt，如何长成一个完整的三维模型</h2>
          <p className="ov-lead">TRIPO 是由 VAST 打造的 AI 原生三维创作平台——用文字或图片生成可继续编辑的 3D 模型。</p>
        </R>
        <R delay={70}>
          <div className="fact-grid">
            <div className="fact"><span className="fk">Creators</span><span className="fv">20M+</span><span className="fc">全球创作者</span></div>
            <div className="fact"><span className="fk">3D Models</span><span className="fv">200M</span><span className="fc">AI 生成模型</span></div>
            <div className="fact wide"><span className="fk">Capabilities</span><span className="fline">Text to 3D · Image to 3D</span><span className="fline">游戏 · XR · 动画 · 工业设计 · 3D 打印</span></div>
            <div className="fact wide"><span className="fk">Partnership</span><span className="fline strong">Sony × VAST — 官方 3D 业务合作</span></div>
          </div>
          <div className="tag-row">
            <span className="vtag">CONCEPT VISUAL</span>
            <span className="mono-note">数据来源：tripo3d.ai 官方页面（20M+ 创作者 · 200M 3D 模型）</span>
          </div>
        </R>
      </Zone>

      {/* 03 · PIPELINE */}
      <Zone id="z03">
        <R>
          <span className="eyebrow">THE PIPELINE · 创作管线</span>
          <h2 className="ov-h2">从 Prompt 到可运行 Demo，亲手走完一条完整开发链</h2>
          <div className="stations">
            {['PROMPT', 'TRIPO', 'BLENDER', 'UNITY · UNREAL', 'FINAL DEMO'].map((s, i) => (
              <span className="st" key={s}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                {s}
              </span>
            ))}
          </div>
        </R>
        <R delay={70}>
          <span className="vtag">WORKFLOW EXAMPLE</span>
          <div className="note-block">
            第一期方向：<b>用 AI 生成一个世界，再让它真正运行起来。</b>
          </div>
          <div className="mini-grid">
            {['AI 3D 小游戏', '可交互虚拟场景', 'AI 生成角色与动画', 'XR / VR 体验', '数字校园', '3D 创意工具', '3D 打印 / 产品原型', '成员原创项目'].map((t, i) => (
              <span className="mini" key={i}><b>{String(i + 1).padStart(2, '0')}</b>{t}</span>
            ))}
          </div>
        </R>
      </Zone>

      {/* 04 · PROJECT LAB */}
      <Zone id="z04">
        <R>
          <span className="eyebrow">PROJECT LAB · 项目实验室</span>
          <h2 className="ov-h2">这里不是每月听一次讲座，而是一支真正做项目的团队</h2>
        </R>
        <R delay={70}>
          <div className="duo">
            <div className="mod open">
              <div className="lab">OPEN · 面向所有人</div>
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
            <div className="mod core">
              <div className="lab">CORE · 进阶需投入</div>
              <h3>核心项目组</h3>
              <ul className="list">
                <li>自主提出项目创意</li>
                <li>组建技术与创意团队</li>
                <li>制定 MVP 和开发周期</li>
                <li>用 GitHub 等工具协作</li>
                <li>定期 Sprint 和 Demo Review</li>
                <li>完成可公开演示的作品</li>
              </ul>
            </div>
          </div>
          <div className="note-block">
            该社团由 TRIPO 校园联系人发起。项目方向、技术栈、团队结构和最终成果由学生团队高度自主决定。
          </div>
        </R>
      </Zone>

      {/* 05 · SEMESTER JOURNEY */}
      <Zone id="z05">
        <R>
          <span className="eyebrow">SEMESTER JOURNEY · 学期轨道</span>
          <h2 className="ov-h2">你的一个学期，将从第一次生成走向最终舞台</h2>
        </R>
        <R delay={70}>
          <ol className="track">
            {[
              ['ONBOARDING', '熟悉 TRIPO、AI 3D 工作流和基础工具。'],
              ['IDEA PITCH', '提出项目创意，找到方向相同的队友。'],
              ['TEAM FORMATION', '组建开发、3D、产品、设计和内容团队。'],
              ['BUILD SPRINT', '按短周期 Sprint 开发、测试和迭代。'],
              ['MONTHLY DEMO', '展示进度、接受反馈、解决技术问题。'],
              ['FINAL DEMO DAY', '发布作品，完成演讲、项目视频和作品集材料。'],
            ].map(([en, d], i) => (
              <li key={en} className={i === 5 ? 'lit' : ''}>
                <span className="tn">{i + 1}</span>
                <span className="te">{en}</span>
                <span className="td">{d}</span>
              </li>
            ))}
          </ol>
          <p className="pull">加入时你带来的可能只是一个想法，离开时你应该带走一件真正可以展示的作品。</p>
        </R>
      </Zone>

      {/* 06 · OPPORTUNITY DECK */}
      <Zone id="z06">
        <R>
          <span className="eyebrow">OPPORTUNITY DECK · 资源与职业</span>
          <h2 className="ov-h2">我们提供的不只是活动，而是把创意推向现实的资源</h2>
          <div className="metric">
            <span className="mk">Starting TRIPO Credits</span>
            <span className="mv">3600<i>Credits</i></span>
            <span className="mu">每位成员初始约 3600 TRIPO Credits，项目需要时可申请追加生成额度。</span>
          </div>
        </R>
        <R delay={60}>
          <div className="deck-cols">
            <div className="deck-col">
              <div className="ck">资源支持</div>
              {[
                ['COURSES', 'TRIPO 官方课程和技术内容'],
                ['EVENTS', '官方活动、创意挑战及比赛机会'],
                ['SUPPORT', '技术问题支持和开发反馈'],
                ['SCALE-UP', '优秀大型项目可申请资源、经费或技术支持'],
                ['REVIEW', '项目通过内部评估后有机会获得进一步资源'],
                ['ECOSYSTEM', '按需连接 Unity 等技术生态和合作资源'],
              ].map(([k, v]) => (
                <div className="di" key={k}><b>{k}</b><span>{v}</span></div>
              ))}
            </div>
            <div className="deck-col">
              <div className="ck">最终可以带走</div>
              {['Live Demo — 可运行作品', 'GitHub — 完整代码与协作记录', 'Case Study — 项目复盘', 'Presentation — 演讲 Deck', 'Portfolio — 可展示作品集'].map((t) => (
                <div className="di" key={t}><span>{t}</span></div>
              ))}
            </div>
          </div>
        </R>
        <R delay={90}>
          <div className="career">
            <div className="ck">职业机会</div>
            <ul className="list">
              <li>优秀成员有机会进入 TRIPO/VAST 的实习、培训或项目筛选视野</li>
              <li>表现突出的成员有机会获得公司相关岗位和项目机会的优先关注</li>
              <li>根据岗位匹配和项目表现，有机会连接合作生态中的实习或项目机会</li>
              <li>项目负责人、核心开发者和优秀创作者可形成更有说服力的作品及推荐材料</li>
              <li>有机会参与公司开发者分享、项目演讲和官方展示</li>
            </ul>
          </div>
          <div className="disclaimer">
            实习、培训、推荐及合作机会均需根据项目表现、岗位需求和相关公司筛选确定，不构成录用保证。
          </div>
        </R>
      </Zone>

      {/* 07 · JOIN */}
      <Zone id="z07" tone="center">
        <R>
          <span className="eyebrow">JOIN THE WORLD · 加入</span>
          <div className="statement">
            <p>
              下一批 AI 3D 作品，不应该只是被你刷到。
              <br />
              它们可以由你<span className="ice">亲手做出来</span>。
            </p>
          </div>
          <div className="chips">
            {['Unity / Unreal / 游戏开发', 'Python / AI / 工具开发', 'Blender / 3D 建模 / 动画', 'UI/UX / 视觉设计', '产品 / 项目管理', '建筑 / 艺术 / 工业设计', '内容 / 摄影 / 视频', '零基础但想动手的你'].map((t, i) => (
              <span className={`chip${i % 3 === 0 ? ' k' : ''}`} key={i}>{t}</span>
            ))}
          </div>
        </R>
        <R delay={70}>
          <ContactQR />
          <div className="btn-row">
            <button className="btn btn-primary" onClick={scrollToJoin}>
              添加联系人微信
            </button>
          </div>
          <p className="fine">UW–Madison TRIPO AI 3D Club · 2026 Fall Recruitment</p>
          <p className="fine">具体活动安排、资源支持及机会以项目实际进展和相关方审核为准。</p>
        </R>
      </Zone>
    </>
  )
}
