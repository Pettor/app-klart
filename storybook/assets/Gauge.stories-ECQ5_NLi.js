import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-Q1GcV6wX.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";function r({value:e,total:t,subLabel:n,size:r=132,strokeWidth:o=12}){let s=t>0?Math.max(0,Math.min(1,e/t)):0,c=(r-o)/2,l=2*Math.PI*c,u=l*(1-s),d=(0,i.useId)();return(0,a.jsxs)(`div`,{className:`relative`,style:{width:r,height:r},children:[(0,a.jsxs)(`svg`,{width:r,height:r,children:[(0,a.jsx)(`defs`,{children:(0,a.jsxs)(`linearGradient`,{id:`gauge-${d}`,x1:`0`,y1:`0`,x2:`1`,y2:`1`,children:[(0,a.jsx)(`stop`,{offset:`0%`,stopColor:`var(--accent)`,stopOpacity:`0.8`}),(0,a.jsx)(`stop`,{offset:`100%`,stopColor:`var(--accent)`,stopOpacity:`1`})]})}),(0,a.jsx)(`circle`,{cx:r/2,cy:r/2,r:c,fill:`none`,stroke:`var(--border)`,strokeWidth:o}),(0,a.jsx)(`circle`,{cx:r/2,cy:r/2,r:c,fill:`none`,stroke:`url(#gauge-${d})`,strokeWidth:o,strokeDasharray:l,strokeDashoffset:u,strokeLinecap:`round`,transform:`rotate(-90 ${r/2} ${r/2})`,className:`[transition:stroke-dashoffset_800ms_cubic-bezier(.2,.9,.2,1)]`})]}),(0,a.jsx)(`div`,{className:`absolute inset-0 grid place-items-center text-center`,children:(0,a.jsxs)(`div`,{children:[(0,a.jsxs)(`div`,{className:`font-mono text-3xl font-semibold tracking-tight tabular-nums`,children:[Math.round(s*100),`%`]}),(0,a.jsx)(`div`,{className:`text-default-500 mt-0.5 text-[11px]`,children:n})]})})]})}var i,a;function o(){return(o=e((()=>{i=t(),a=n(),r.__docgenInfo={description:``,methods:[],displayName:`Gauge`,props:{value:{required:!0,tsType:{name:`number`},description:``},total:{required:!0,tsType:{name:`number`},description:``},subLabel:{required:!0,tsType:{name:`string`},description:``},size:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`132`,computed:!1}},strokeWidth:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`12`,computed:!1}}}}})))()}var s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{o(),s={title:`Display/Gauge`,component:r,tags:[`autodocs`]},c={value:1280,total:2350,subLabel:`active rate`},l={args:c},u={args:{...c,value:2100,total:2350,subLabel:`completion`}},d={args:{...c,value:300,total:2350,subLabel:`conversion`}},f={args:{...c,value:0,subLabel:`no data`}},p={args:{...c,size:80,strokeWidth:8}},m=[`Default`,`High`,`Low`,`Empty`,`Small`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    value: 2100,
    total: 2350,
    subLabel: "completion"
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    value: 300,
    total: 2350,
    subLabel: "conversion"
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    value: 0,
    subLabel: "no data"
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    size: 80,
    strokeWidth: 8
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{l as Default,f as Empty,u as High,d as Low,p as Small,m as __namedExportsOrder,s as default};