import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-Q1GcV6wX.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./ResizeHandle-HY3zSMIf.js";function a(e){let[t,n]=(0,o.useState)(e.width),r=t=>Math.min(e.maxWidth,Math.max(e.minWidth,t));return(0,s.jsx)(`div`,{className:`flex h-64 justify-end`,children:(0,s.jsxs)(`aside`,{className:`bg-surface border-separator relative border-l p-4`,style:{width:t},children:[(0,s.jsx)(i,{...e,width:t,onResize:t=>{n(r(t)),e.onResize(t)},onResizeEnd:t=>{n(r(t)),e.onResizeEnd(t)}}),t,`px`]})})}var o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{o=t(),r(),s=n(),{expect:c,fn:l,userEvent:u}=__STORYBOOK_MODULE_TEST__,d={component:i,title:`Input/Resize Handle`,tags:[`autodocs`],render:e=>(0,s.jsx)(a,{...e})},f={width:320,minWidth:240,maxWidth:560,edge:`left`,ariaLabel:`Resize panel`,onResize:l(),onResizeEnd:l(),onReset:l()},p={args:f},m={args:f,play:async({args:e,canvas:t})=>{let n=t.getByRole(`separator`,{name:`Resize panel`});n.focus(),await u.keyboard(`{ArrowLeft}`),await c(e.onResizeEnd).toHaveBeenLastCalledWith(336),await c(n).toHaveAttribute(`aria-valuenow`,`336`),await u.keyboard(`{Home}`),await c(e.onResizeEnd).toHaveBeenLastCalledWith(240)}},h={args:f,play:async({args:e,canvas:t})=>{await u.dblClick(t.getByRole(`separator`)),await c(e.onReset).toHaveBeenCalled()}},g=[`LeftEdge`,`KeyboardResize`,`DoubleClickResets`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas
  }) => {
    const handle = canvas.getByRole("separator", {
      name: "Resize panel"
    });
    handle.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(args.onResizeEnd).toHaveBeenLastCalledWith(336);
    await expect(handle).toHaveAttribute("aria-valuenow", "336");
    await userEvent.keyboard("{Home}");
    await expect(args.onResizeEnd).toHaveBeenLastCalledWith(240);
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas
  }) => {
    await userEvent.dblClick(canvas.getByRole("separator"));
    await expect(args.onReset).toHaveBeenCalled();
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{h as DoubleClickResets,m as KeyboardResize,p as LeftEdge,g as __namedExportsOrder,d as default};