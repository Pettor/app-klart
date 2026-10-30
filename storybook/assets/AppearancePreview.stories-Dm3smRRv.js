import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{c as t,t as n}from"./src-CdQSlvMR.js";import{n as r,t as i}from"./AppearancePreview-DEF-hVw7.js";var a,o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{n(),r(),{expect:a,waitFor:o}=__STORYBOOK_MODULE_TEST__,s={component:i,title:`Display/Appearance Preview`,tags:[`autodocs`],decorators:[t]},c={today:`2026-10-21`,density:`comfortable`,tintByContext:!0,className:`max-w-[340px]`},l={args:c},u={args:{...c,density:`compact`}},d={args:{...c,tintByContext:!1}},f={args:c,play:async({canvas:e,userEvent:t})=>{let n=()=>e.getAllByTestId(`task-row__important`)[0];await a(n()).toHaveAttribute(`aria-pressed`,`true`),await t.click(n()),await o(()=>a(n()).toHaveAttribute(`aria-pressed`,`false`)),await t.click(e.getAllByTestId(`task-row__toggle`)[0]),await o(()=>a(e.getAllByTestId(`task-row__important`)).toHaveLength(1),{timeout:2e3})}},p=[`Default`,`Compact`,`Untinted`,`Interactive`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    density: "compact"
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    tintByContext: false
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    canvas,
    userEvent
  }) => {
    const star = (): HTMLElement => canvas.getAllByTestId("task-row__important")[0]!;
    await expect(star()).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(star());
    await waitFor(() => expect(star()).toHaveAttribute("aria-pressed", "false"));
    await userEvent.click(canvas.getAllByTestId("task-row__toggle")[0]!);
    await waitFor(() => expect(canvas.getAllByTestId("task-row__important")).toHaveLength(1), {
      timeout: 2000
    });
  }
}`,...f.parameters?.docs?.source},description:{story:`The sample tasks can be checked off and starred, so the motion setting can be tried.`,...f.parameters?.docs?.description}}}})))()}m();export{u as Compact,l as Default,f as Interactive,d as Untinted,p as __namedExportsOrder,s as default};