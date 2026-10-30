import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-Q1GcV6wX.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";function r({data:e,stroke:t,fill:n,width:r=86,height:o=28}){let s=(0,i.useId)();if(e.length<2)return null;let c=Math.min(...e),l=Math.max(...e)-c||1,u=r/(e.length-1),d=e.map((e,t)=>[t*u,o-(e-c)/l*(o-4)-2]),f=d.map((e,t)=>`${t===0?`M`:`L`}${e[0].toFixed(2)},${e[1].toFixed(2)}`).join(` `),p=`${f} L ${r},${o} L 0,${o} Z`,m=d[d.length-1]??[0,0];return(0,a.jsxs)(`svg`,{width:r,height:o,className:`block overflow-visible`,"aria-hidden":!0,children:[(0,a.jsx)(`defs`,{children:(0,a.jsxs)(`linearGradient`,{id:`sg-${s}`,x1:`0`,x2:`0`,y1:`0`,y2:`1`,children:[(0,a.jsx)(`stop`,{offset:`0%`,stopColor:n,stopOpacity:`0.35`}),(0,a.jsx)(`stop`,{offset:`100%`,stopColor:n,stopOpacity:`0`})]})}),(0,a.jsx)(`path`,{d:p,fill:`url(#sg-${s})`}),(0,a.jsx)(`path`,{d:f,fill:`none`,stroke:t,strokeWidth:1.75,strokeLinejoin:`round`,strokeLinecap:`round`}),(0,a.jsx)(`circle`,{cx:m[0],cy:m[1],r:2.5,fill:t})]})}var i,a;function o(){return(o=e((()=>{i=t(),a=n(),r.__docgenInfo={description:``,methods:[],displayName:`Sparkline`,props:{data:{required:!0,tsType:{name:`Array`,elements:[{name:`number`}],raw:`number[]`},description:``},stroke:{required:!0,tsType:{name:`string`},description:``},fill:{required:!0,tsType:{name:`string`},description:``},width:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`86`,computed:!1}},height:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`28`,computed:!1}}}}})))()}var s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{o(),s={title:`Display/Sparkline`,component:r,tags:[`autodocs`]},c=[22,24,23,28,26,31,30,34,33,38,36,45],l=[45,42,38,35,33,30,28,25,22,20,18,15],u=[14,13.5,14.2,13,13.5,12.8,13.1,12.9,12.6,13,12.8,12.5],d={data:c,stroke:`var(--accent)`,fill:`var(--accent)`},f={args:d},p={args:{...d,stroke:`var(--success)`,fill:`var(--success)`}},m={args:{...d,data:u,stroke:`var(--warning)`,fill:`var(--warning)`}},h={args:{...d,data:l,stroke:`var(--danger)`,fill:`var(--danger)`}},g={args:{...d,stroke:`#9353d3`,fill:`#9353d3`}},_={args:{...d,width:160,height:40}},v=[`Accent`,`Success`,`Warning`,`Downtrend`,`Violet`,`Wide`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    stroke: "var(--success)",
    fill: "var(--success)"
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    data: flat,
    stroke: "var(--warning)",
    fill: "var(--warning)"
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    data: downtrend,
    stroke: "var(--danger)",
    fill: "var(--danger)"
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    stroke: "#9353d3",
    fill: "#9353d3"
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    width: 160,
    height: 40
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{f as Accent,h as Downtrend,p as Success,g as Violet,m as Warning,_ as Wide,v as __namedExportsOrder,s as default};