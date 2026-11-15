import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-Q1GcV6wX.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{c as r,t as i}from"./src-sCHxcdQJ.js";import{n as a,o,r as s}from"./KlartContext-B0iHfyQE.js";import{i as c,n as l,r as u,t as d}from"./QuickAdd-Bml3Xpla.js";function f({initialValue:e=``,compact:t,isPlanned:n,onSubmit:r}){let[i,o]=(0,p.useState)(e),c=l(i,{today:_,contexts:a,currentContext:`personal`}),d=s(a,c.context),f=i.trim()?{title:c.title,contextName:d.name,contextColor:d.color,due:c.due,remindAt:c.remindAt,repeat:c.repeat,important:c.important,tags:c.tags.filter(e=>e!==d.tag),links:c.links}:null;return(0,m.jsx)(`div`,{className:`w-[640px] max-w-full`,children:(0,m.jsx)(u,{value:i,onChange:o,onSubmit:()=>{r(i),o(``)},preview:f,today:_,compact:t,isPlanned:n})})}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{p=t(),i(),c(),o(),d(),m=n(),{expect:h,fn:g}=__STORYBOOK_MODULE_TEST__,_=`2026-10-21`,v={component:f,title:`Input/Quick Add`,tags:[`autodocs`],decorators:[r],args:{onSubmit:g()}},y={},b={args:{initialValue:`#work #acme @fri ^09:00 ! prepare sprint planning`}},x={args:{initialValue:`#work review gateway PR https://github.com/acme/gateway-client/pull/412`},play:async({canvas:e})=>{let t=e.getByTestId(`quick-add__preview`);await h(t).toHaveTextContent(`Review gateway PR`),await h(t).toHaveTextContent(`github.com`)}},S={args:{initialValue:`#home *weekly @fri water the plants`},play:async({canvas:e})=>{await h(e.getByTestId(`quick-add__repeat`)).toHaveTextContent(`Every week on Fri`)}},C={args:{compact:!0}},w={args:{isPlanned:!0},play:async({canvas:e})=>{await h(e.getByTestId(`quick-add__input`)).toHaveAttribute(`placeholder`,`Add a task  ·  *daily  *weekly  *mon,thu  *2w  *monthly`)}},T={args:{isPlanned:!0,compact:!0}},E={play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByTestId(`quick-add__input`);await n.type(r,`#work @tomorrow find more tasks to create`);let i=t.getByTestId(`quick-add__preview`);await h(i).toHaveTextContent(`Find more tasks to create`),await h(i).toHaveTextContent(`Work`),await h(i).toHaveTextContent(`Due Tomorrow (2026-10-22)`),await n.keyboard(`{Enter}`),await h(e.onSubmit).toHaveBeenCalledWith(`#work @tomorrow find more tasks to create`),await h(r).toHaveValue(``)}},D=[`Empty`,`WithSyntax`,`WithLink`,`Recurring`,`Compact`,`Planned`,`PlannedCompact`,`TypeAndSubmit`],y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
  args: {
    isPlanned: true
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByTestId("quick-add__input")).toHaveAttribute("placeholder", "Add a task  ·  *daily  *weekly  *mon,thu  *2w  *monthly");
  }
}`,...w.parameters?.docs?.source},description:{story:`In Planned the placeholder shows the repeat syntax.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    isPlanned: true,
    compact: true
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}}})))()}O();export{C as Compact,y as Empty,w as Planned,T as PlannedCompact,S as Recurring,E as TypeAndSubmit,x as WithLink,b as WithSyntax,D as __namedExportsOrder,v as default};