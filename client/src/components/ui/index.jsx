/**
 * SmartAccounts UI Kit — inline styles prevent Tailwind v4 production purge glitches
 */
import { cn } from '../../utils/helpers';
import { Loader2, X, ChevronDown } from 'lucide-react';

const T = {
  card:'#111827', input:'#0a0f1a', hover:'#1c2a40', border:'#1a2540',
  text:'#e2e8f0', sub:'#94a3b8', muted:'#475569',
  blue:'#3b82f6', green:'#10b981', red:'#ef4444', amber:'#f59e0b', purple:'#8b5cf6',
};

export const Button = ({ children, variant='primary', size='md', loading, icon, className, style, ...props }) => {
  const vs = {
    primary:  {background:'#2563eb',color:'#fff',boxShadow:'0 4px 14px rgba(37,99,235,0.3)'},
    secondary:{background:T.card,color:T.text,border:`1px solid ${T.border}`},
    danger:   {background:'rgba(239,68,68,0.1)',color:'#f87171',border:'1px solid rgba(239,68,68,0.2)'},
    ghost:    {background:'transparent',color:T.sub},
    success:  {background:'rgba(16,185,129,0.1)',color:'#34d399',border:'1px solid rgba(16,185,129,0.2)'},
    outline:  {background:'transparent',color:T.sub,border:`1px solid ${T.border}`},
    warning:  {background:'rgba(245,158,11,0.1)',color:'#fbbf24',border:'1px solid rgba(245,158,11,0.2)'},
  };
  const ss = {
    sm:{fontSize:11,padding:'5px 10px',height:28}, md:{fontSize:13,padding:'7px 14px',height:34},
    lg:{fontSize:13,padding:'9px 18px',height:38}, xl:{fontSize:14,padding:'11px 24px',height:44},
    icon:{fontSize:13,padding:7,height:32,width:32},
  };
  return (
    <button style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,fontWeight:500,borderRadius:10,border:'none',cursor:props.disabled||loading?'not-allowed':'pointer',opacity:props.disabled||loading?0.45:1,transition:'all 0.15s',fontFamily:'inherit',whiteSpace:'nowrap',...vs[variant],...ss[size],...style}} {...props}>
      {loading?<Loader2 size={13} className="animate-spin"/>:icon}{children}
    </button>
  );
};

export const Input = ({ label, error, icon, wrapperClass, style, ...props }) => (
  <div className={wrapperClass} style={{display:'flex',flexDirection:'column',gap:6}}>
    {label&&<label style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</label>}
    <div style={{position:'relative'}}>
      {icon&&<span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:T.muted,pointerEvents:'none',display:'flex'}}>{icon}</span>}
      <input style={{width:'100%',background:T.input,border:`1px solid ${error?T.red:T.border}`,borderRadius:10,color:T.text,fontSize:13,padding:icon?'8px 12px 8px 34px':'8px 12px',transition:'border-color 0.15s,box-shadow 0.15s',fontFamily:'inherit',...style}}
        onFocus={e=>{e.target.style.borderColor=T.blue;e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.12)'}}
        onBlur={e=>{e.target.style.borderColor=error?T.red:T.border;e.target.style.boxShadow='none'}} {...props}/>
    </div>
    {error&&<p style={{fontSize:11,color:T.red,marginTop:2}}>{error}</p>}
  </div>
);

export const Select = ({ label, error, wrapperClass, children, style, ...props }) => (
  <div className={wrapperClass} style={{display:'flex',flexDirection:'column',gap:6}}>
    {label&&<label style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</label>}
    <div style={{position:'relative'}}>
      <select style={{width:'100%',background:T.input,border:`1px solid ${error?T.red:T.border}`,borderRadius:10,color:T.text,fontSize:13,padding:'8px 32px 8px 12px',appearance:'none',fontFamily:'inherit',cursor:'pointer',...style}}
        onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=error?T.red:T.border} {...props}>{children}</select>
      <ChevronDown size={13} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:T.muted,pointerEvents:'none'}}/>
    </div>
    {error&&<p style={{fontSize:11,color:T.red,marginTop:2}}>{error}</p>}
  </div>
);

export const Textarea = ({ label, error, wrapperClass, style, ...props }) => (
  <div className={wrapperClass} style={{display:'flex',flexDirection:'column',gap:6}}>
    {label&&<label style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</label>}
    <textarea style={{width:'100%',background:T.input,border:`1px solid ${error?T.red:T.border}`,borderRadius:10,color:T.text,fontSize:13,padding:'8px 12px',resize:'none',fontFamily:'inherit',transition:'border-color 0.15s',lineHeight:1.5,...style}} rows={3}
      onFocus={e=>{e.target.style.borderColor=T.blue;e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.12)'}}
      onBlur={e=>{e.target.style.borderColor=error?T.red:T.border;e.target.style.boxShadow='none'}} {...props}/>
    {error&&<p style={{fontSize:11,color:T.red,marginTop:2}}>{error}</p>}
  </div>
);

export const Card = ({ children, className, hover, style, ...props }) => (
  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:20,...style}} className={className} {...props}>
    {children}
  </div>
);

export const Badge = ({ children, variant='default', className }) => {
  const vs = {
    default:{background:'rgba(100,116,139,0.15)',color:'#94a3b8'},
    success:{background:'rgba(16,185,129,0.12)',color:'#34d399'},
    danger: {background:'rgba(239,68,68,0.12)', color:'#f87171'},
    warning:{background:'rgba(245,158,11,0.12)',color:'#fbbf24'},
    info:   {background:'rgba(59,130,246,0.12)',color:'#60a5fa'},
    purple: {background:'rgba(139,92,246,0.12)',color:'#a78bfa'},
  };
  return <span className={className} style={{display:'inline-flex',alignItems:'center',fontSize:11,fontWeight:600,padding:'2px 9px',borderRadius:999,whiteSpace:'nowrap',...(vs[variant]||vs.default)}}>{children}</span>;
};

export const Modal = ({ isOpen, onClose, title, children, size='md' }) => {
  if (!isOpen) return null;
  const maxW={sm:440,md:580,lg:720,xl:880,full:1100};
  return (
    <div className="animate-fade-in" style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(6px)'}} onClick={onClose}/>
      <div className="animate-fade-in-up" style={{position:'relative',width:'100%',maxWidth:maxW[size]||580,background:T.card,border:`1px solid ${T.border}`,borderRadius:16,boxShadow:'0 24px 80px rgba(0,0,0,0.6)',maxHeight:'90vh',display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <h2 style={{fontSize:14,fontWeight:600,color:T.text}}>{title}</h2>
          <button onClick={onClose} style={{padding:6,borderRadius:8,background:'transparent',border:'none',color:T.sub,cursor:'pointer',display:'flex'}}><X size={15}/></button>
        </div>
        <div style={{padding:20,overflowY:'auto',flex:1}}>{children}</div>
      </div>
    </div>
  );
};

export const Spinner = ({ size=20, className }) => <Loader2 size={size} className={cn('animate-spin',className)} style={{color:T.blue}}/>;

export const PageLoader = () => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:240}}>
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
      <Spinner size={28}/><p style={{fontSize:13,color:T.muted}}>Loading...</p>
    </div>
  </div>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'48px 24px',textAlign:'center'}}>
    <div style={{fontSize:44,marginBottom:16,opacity:0.3}}>{icon||'📭'}</div>
    <h3 style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:6}}>{title||'Nothing here yet'}</h3>
    <p style={{fontSize:13,color:T.muted,marginBottom:20,maxWidth:280}}>{description}</p>
    {action}
  </div>
);

export const StatCard = ({ label, value, icon, change, changeLabel, sublabel, color='blue', loading }) => {
  const ic={blue:{bg:'rgba(59,130,246,0.12)',color:'#60a5fa'},green:{bg:'rgba(16,185,129,0.12)',color:'#34d399'},red:{bg:'rgba(239,68,68,0.12)',color:'#f87171'},purple:{bg:'rgba(139,92,246,0.12)',color:'#a78bfa'},amber:{bg:'rgba(245,158,11,0.12)',color:'#fbbf24'}};
  const c=ic[color]||ic.blue;
  return (
    <div className="animate-fade-in-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:20,transition:'border-color 0.15s'}}
      onMouseEnter={e=>e.currentTarget.style.borderColor='#243352'} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
        <div style={{padding:10,borderRadius:12,background:c.bg,color:c.color,display:'flex'}}>{icon}</div>
        {change!==undefined&&<span style={{fontSize:11,fontWeight:600,padding:'3px 8px',borderRadius:999,background:change>=0?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)',color:change>=0?'#34d399':'#f87171'}}>{change>=0?'↑':'↓'} {Math.abs(change)}%</span>}
      </div>
      {loading?<div style={{height:32,borderRadius:8,marginBottom:6}} className="skeleton"/>:<p style={{fontSize:26,fontWeight:700,color:T.text,letterSpacing:'-0.02em',lineHeight:1,marginBottom:4}}>{value}</p>}
      <p style={{fontSize:12,color:T.muted,fontWeight:500}}>{label}</p>
      {sublabel&&<p style={{fontSize:11,color:'#334155',marginTop:3}}>{sublabel}</p>}
      {changeLabel&&<p style={{fontSize:11,color:'#334155',marginTop:3}}>{changeLabel}</p>}
    </div>
  );
};

export const Table = ({ columns, data, loading, onRowClick, emptyState, emptyIcon }) => (
  <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
      <thead>
        <tr style={{borderBottom:`1px solid ${T.border}`}}>
          {columns.map(col=><th key={col.key+col.label} className={col.className} style={{padding:'10px 14px',textAlign:'left',fontSize:10,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:'0.07em',whiteSpace:'nowrap'}}>{col.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {loading?Array.from({length:6}).map((_,i)=>(
          <tr key={i} style={{borderBottom:`1px solid rgba(26,37,64,0.5)`}}>
            {columns.map(col=><td key={col.key+i} style={{padding:'12px 14px'}}><div style={{height:14,borderRadius:6,width:`${55+Math.random()*35}%`}} className="skeleton"/></td>)}
          </tr>
        )):!data?.length?(<tr><td colSpan={columns.length}><EmptyState icon={emptyIcon} description={emptyState||'No records found'}/></td></tr>
        ):data.map((row,i)=>(
          <tr key={row._id||i} onClick={()=>onRowClick?.(row)} style={{borderBottom:`1px solid rgba(26,37,64,0.4)`,cursor:onRowClick?'pointer':'default',transition:'background 0.1s'}}
            onMouseEnter={e=>{if(onRowClick)e.currentTarget.style.background='rgba(28,42,64,0.6)'}}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            {columns.map(col=><td key={col.key+col.label+i} className={col.className} style={{padding:'12px 14px',color:T.sub}}>{col.render?col.render(row[col.key],row):(row[col.key]??'—')}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Pagination = ({ page, pages, total, limit, onPage }) => {
  if (!pages||pages<=1) return null;
  const start=(page-1)*(limit||20)+1, end=Math.min(page*(limit||20),total);
  const nums=[];
  for(let p=Math.max(1,page-2);p<=Math.min(pages,page+2);p++) nums.push(p);
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderTop:`1px solid ${T.border}`}}>
      <p style={{fontSize:12,color:T.muted}}>Showing {start}–{end} of {total}</p>
      <div style={{display:'flex',gap:4}}>
        <Button variant="ghost" size="sm" onClick={()=>onPage(page-1)} disabled={page===1}>←</Button>
        {nums[0]>1&&<><Button variant="ghost" size="sm" onClick={()=>onPage(1)}>1</Button>{nums[0]>2&&<span style={{color:T.muted,padding:'0 2px',alignSelf:'center',fontSize:12}}>…</span>}</>}
        {nums.map(p=><Button key={p} variant={p===page?'primary':'ghost'} size="sm" onClick={()=>onPage(p)}>{p}</Button>)}
        {nums[nums.length-1]<pages&&<>{nums[nums.length-1]<pages-1&&<span style={{color:T.muted,padding:'0 2px',alignSelf:'center',fontSize:12}}>…</span>}<Button variant="ghost" size="sm" onClick={()=>onPage(pages)}>{pages}</Button></>}
        <Button variant="ghost" size="sm" onClick={()=>onPage(page+1)} disabled={page===pages}>→</Button>
      </div>
    </div>
  );
};

export const AlertBanner = ({ type='info', icon, title, message, onDismiss }) => {
  const types={info:{border:'rgba(59,130,246,0.25)',bg:'rgba(59,130,246,0.07)',color:'#60a5fa'},success:{border:'rgba(16,185,129,0.25)',bg:'rgba(16,185,129,0.07)',color:'#34d399'},warning:{border:'rgba(245,158,11,0.25)',bg:'rgba(245,158,11,0.07)',color:'#fbbf24'},danger:{border:'rgba(239,68,68,0.25)',bg:'rgba(239,68,68,0.07)',color:'#f87171'},positive:{border:'rgba(16,185,129,0.25)',bg:'rgba(16,185,129,0.07)',color:'#34d399'},alert:{border:'rgba(239,68,68,0.25)',bg:'rgba(239,68,68,0.07)',color:'#f87171'}};
  const s=types[type]||types.info;
  return (
    <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'12px 14px',borderRadius:12,border:`1px solid ${s.border}`,background:s.bg}}>
      {icon&&<span style={{fontSize:16,flexShrink:0,marginTop:1}}>{icon}</span>}
      <div style={{flex:1,minWidth:0}}>
        {title&&<p style={{fontSize:12,fontWeight:600,color:s.color,marginBottom:2}}>{title}</p>}
        <p style={{fontSize:12,color:T.sub}}>{message}</p>
      </div>
      {onDismiss&&<button onClick={onDismiss} style={{padding:3,border:'none',background:'transparent',color:T.muted,cursor:'pointer',flexShrink:0}}><X size={13}/></button>}
    </div>
  );
};

export const Divider = ({ label }) => (
  <div style={{display:'flex',alignItems:'center',gap:10,margin:'16px 0'}}>
    <div style={{flex:1,height:1,background:T.border}}/>
    {label&&<span style={{fontSize:11,color:T.muted,whiteSpace:'nowrap'}}>{label}</span>}
    <div style={{flex:1,height:1,background:T.border}}/>
  </div>
);

export const Toggle = ({ checked, onChange, label }) => (
  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',userSelect:'none'}}>
    <div onClick={()=>onChange(!checked)} style={{width:36,height:20,borderRadius:999,position:'relative',background:checked?T.blue:T.border,transition:'background 0.2s',cursor:'pointer'}}>
      <div style={{position:'absolute',top:3,width:14,height:14,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 4px rgba(0,0,0,0.3)',transition:'left 0.2s',left:checked?19:3}}/>
    </div>
    {label&&<span style={{fontSize:13,color:T.sub}}>{label}</span>}
  </label>
);
