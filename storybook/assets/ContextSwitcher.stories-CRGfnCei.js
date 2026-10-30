import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./ContextSwitcher-D5qXnokL.js";import{c as r,t as i}from"./src-CdQSlvMR.js";var a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{i(),t(),{expect:a,fn:o,screen:s,waitFor:c}=__STORYBOOK_MODULE_TEST__,l={component:n,title:`Actions/Context Switcher`,tags:[`autodocs`],decorators:[r]},u={selectedId:`personal`,options:[{id:`all`,name:`All contexts`,color:`all`,dayCount:5,shortcut:`0`},{id:`personal`,name:`Personal`,color:`blue`,dayCount:2,shortcut:`1`},{id:`work`,name:`Work`,color:`orange`,dayCount:2,shortcut:`2`},{id:`club`,name:`Football club`,color:`green`,dayCount:1,shortcut:`3`}],onSelect:o(),onManage:o()},d={args:u},f={args:{...u,variant:`compact`,selectedId:`work`}},p={args:u,play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByTestId(`context-switcher__trigger`));let r=await s.findByRole(`menuitemradio`,{name:/Work/});await n.click(r),await c(()=>a(e.onSelect).toHaveBeenCalledWith(`work`))}},m=[`Sidebar`,`Compact`,`SwitchContext`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    variant: "compact",
    selectedId: "work"
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByTestId("context-switcher__trigger"));
    const work = await screen.findByRole("menuitemradio", {
      name: /Work/
    });
    await userEvent.click(work);
    await waitFor(() => expect(args.onSelect).toHaveBeenCalledWith("work"));
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{f as Compact,d as Sidebar,p as SwitchContext,m as __namedExportsOrder,l as default};