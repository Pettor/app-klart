import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-Q1GcV6wX.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{c as r,t as i}from"./src-axRF29CE.js";import{n as a,o,r as s}from"./KlartContext-B0iHfyQE.js";import{i as c,n as l,r as u,t as d}from"./QuickAdd-CYX5AFzF.js";function f({initialValue:e=``,compact:t,onSubmit:n}){let[r,i]=(0,p.useState)(e),o=l(r,{today:_,contexts:a,currentContext:`personal`}),c=s(a,o.context),d=r.trim()?{title:o.title,contextName:c.name,contextColor:c.color,due:o.due,remindAt:o.remindAt,repeat:o.repeat,important:o.important,tags:o.tags.filter(e=>e!==c.tag),links:o.links}:null;return(0,m.jsx)(`div`,{className:`w-[640px] max-w-full`,children:(0,m.jsx)(u,{value:r,onChange:i,onSubmit:()=>{n(r),i(``)},preview:d,today:_,compact:t})})}var p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{p=t(),i(),c(),o(),d(),m=n(),{expect:h,fn:g}=__STORYBOOK_MODULE_TEST__,_=`2026-10-21`,v={component:f,title:`Input/Quick Add`,tags:[`autodocs`],decorators:[r],args:{onSubmit:g()}},y={},b={args:{initialValue:`#work #acme @fri ^09:00 ! prepare sprint planning`}},x={args:{initialValue:`#work review gateway PR https://github.com/acme/gateway-client/pull/412`},play:async({canvas:e})=>{let t=e.getByTestId(`quick-add__preview`);await h(t).toHaveTextContent(`Review gateway PR`),await h(t).toHaveTextContent(`github.com`)}},S={args:{initialValue:`#home *weekly @fri water the plants`},play:async({canvas:e})=>{await h(e.getByTestId(`quick-add__repeat`)).toHaveTextContent(`Every week on Fri`)}},C={args:{compact:!0}},w={play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByTestId(`quick-add__input`);await n.type(r,`#work @tomorrow find more tasks to create`);let i=t.getByTestId(`quick-add__preview`);await h(i).toHaveTextContent(`Find more tasks to create`),await h(i).toHaveTextContent(`Work`),await h(i).toHaveTextContent(`Due Tomorrow (2026-10-22)`),await n.keyboard(`{Enter}`),await h(e.onSubmit).toHaveBeenCalledWith(`#work @tomorrow find more tasks to create`),await h(r).toHaveValue(``)}},T=[`Empty`,`WithSyntax`,`WithLink`,`Recurring`,`Compact`,`TypeAndSubmit`],y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    initialValue: "#work #acme @fri ^09:00 ! prepare sprint planning"
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    initialValue: "#home *weekly @fri water the plants"
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByTestId("quick-add__repeat")).toHaveTextContent("Every week on Fri");
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}}})))()}E();export{C as Compact,y as Empty,S as Recurring,w as TypeAndSubmit,x as WithLink,b as WithSyntax,T as __namedExportsOrder,v as default};