import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-Q1GcV6wX.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{c as r,t as i}from"./src-CdQSlvMR.js";import{n as a,r as o,s,t as c}from"./LocalDate-Cs0n-t4y.js";import{r as l}from"./TaskLink-YsDmK9RN.js";import{a as u,i as d,n as f,o as p,r as m}from"./KlartContext-B0iHfyQE.js";import{n as h,t as g}from"./QuickAddInput-Bs4nOiG-.js";function _(e,t){let n=e.toLowerCase();if(o(n))return n;if(n===`today`||n===`tod`)return t;if(n===`tomorrow`||n===`tmr`)return c(t,1);let r=n.match(/^\+(\d{1,3})d$/);if(r)return c(t,Number(r[1]));if(n.length>=3){let e=x.findIndex(e=>e.startsWith(n));if(e>=0){let n=(e-s(t)+7)%7||7;return c(t,n)}}return null}function v(e,t,n){let r=e.match(/^(?:(.+)[-T])?(\d{1,2}):(\d{2})$/i);if(!r)return null;let i=Number(r[2]),a=Number(r[3]);if(i>23||a>59)return null;let o=r[1]?_(r[1],n):t??n;return o?`${o}T${String(i).padStart(2,`0`)}:${r[3]}`:null}function y(e){return e.charAt(0).toUpperCase()+e.slice(1)}function b(e,{today:t,contexts:n,currentContext:r}){let i=[],a=[],o=[],s=null,c=null,f=!1;for(let n of e.split(/\s+/)){if(!n)continue;if(n.length>1&&n.startsWith(`#`)){let e=n.slice(1).toLowerCase();i.includes(e)||i.push(e);continue}if(n.length>1&&n.startsWith(`@`)){let e=_(n.slice(1),t);if(e){s=e;continue}}if(n.length>1&&n.startsWith(`^`)){c=n.slice(1);continue}let e=l(n);if(e){o.includes(e)||o.push(e);continue}if(n===`!`){f=!0;continue}a.push(n)}let p=c?v(c,s,t):null;c&&!p&&a.push(`^${c}`);let m=i.map(e=>d(n,e)).find(e=>!!e),h=r!==`all`&&n.some(e=>e.id===r)?r:u(n);return{title:y(a.join(` `)),context:m?.id??h,tags:i,due:s,remindAt:p,important:f,links:o,raw:e.trim()}}var x;function S(){return(S=e((()=>{a(),p(),x=[`sunday`,`monday`,`tuesday`,`wednesday`,`thursday`,`friday`,`saturday`]})))()}function C({initialValue:e=``,compact:t,onSubmit:n}){let[r,i]=(0,w.useState)(e),a=b(r,{today:O,contexts:f,currentContext:`personal`}),o=m(f,a.context),s=r.trim()?{title:a.title,contextName:o.name,contextColor:o.color,due:a.due,remindAt:a.remindAt,important:a.important,tags:a.tags.filter(e=>e!==o.tag),links:a.links}:null;return(0,T.jsx)(`div`,{className:`w-[640px] max-w-full`,children:(0,T.jsx)(g,{value:r,onChange:i,onSubmit:()=>{n(r),i(``)},preview:s,today:O,compact:t})})}var w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{w=t(),i(),h(),p(),S(),T=n(),{expect:E,fn:D}=__STORYBOOK_MODULE_TEST__,O=`2026-10-21`,k={component:C,title:`Input/Quick Add`,tags:[`autodocs`],decorators:[r],args:{onSubmit:D()}},A={},j={args:{initialValue:`#work #acme @fri ^09:00 ! prepare sprint planning`}},M={args:{initialValue:`#work review gateway PR https://github.com/acme/gateway-client/pull/412`},play:async({canvas:e})=>{let t=e.getByTestId(`quick-add__preview`);await E(t).toHaveTextContent(`Review gateway PR`),await E(t).toHaveTextContent(`github.com`)}},N={args:{compact:!0}},P={play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByTestId(`quick-add__input`);await n.type(r,`#work @tomorrow find more tasks to create`);let i=t.getByTestId(`quick-add__preview`);await E(i).toHaveTextContent(`Find more tasks to create`),await E(i).toHaveTextContent(`Work`),await E(i).toHaveTextContent(`Due Tomorrow (2026-10-22)`),await n.keyboard(`{Enter}`),await E(e.onSubmit).toHaveBeenCalledWith(`#work @tomorrow find more tasks to create`),await E(r).toHaveValue(``)}},F=[`Empty`,`WithSyntax`,`WithLink`,`Compact`,`TypeAndSubmit`],A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    initialValue: "#work #acme @fri ^09:00 ! prepare sprint planning"
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    initialValue: "#work review gateway PR https://github.com/acme/gateway-client/pull/412"
  },
  play: async ({
    canvas
  }) => {
    const preview = canvas.getByTestId("quick-add__preview");
    await expect(preview).toHaveTextContent("Review gateway PR");
    await expect(preview).toHaveTextContent("github.com");
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    const input = canvas.getByTestId("quick-add__input");
    await userEvent.type(input, "#work @tomorrow find more tasks to create");
    const preview = canvas.getByTestId("quick-add__preview");
    await expect(preview).toHaveTextContent("Find more tasks to create");
    await expect(preview).toHaveTextContent("Work");
    await expect(preview).toHaveTextContent("Due Tomorrow (2026-10-22)");
    await userEvent.keyboard("{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledWith("#work @tomorrow find more tasks to create");
    await expect(input).toHaveValue("");
  }
}`,...P.parameters?.docs?.source}}}})))()}I();export{N as Compact,A as Empty,P as TypeAndSubmit,M as WithLink,j as WithSyntax,F as __namedExportsOrder,k as default};