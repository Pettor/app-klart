import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./TaskStyleSelector-y3vw26hO.js";var r,i,a,o,s,c,l,u,d,f;function p(){return(p=e((()=>{t(),{expect:r,fn:i}=__STORYBOOK_MODULE_TEST__,a={component:n,title:`Actions/Task Style Selector`,tags:[`autodocs`]},o={style:`theme`,themeStyle:`raised`,onSelect:i()},s={args:o},c={args:{...o,style:`glow`}},l={args:{...o,style:`square`}},u={args:o,play:async({args:e,canvas:t,userEvent:n})=>{await r(t.getByRole(`radio`,{name:`Theme's own`})).toBeChecked(),await n.click(t.getByRole(`radio`,{name:`Outline`})),await r(e.onSelect).toHaveBeenCalledWith(`outline`)}},d={args:{...o,style:`flat`},play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByRole(`radio`,{name:`Theme's own`})),await r(e.onSelect).toHaveBeenCalledWith(`theme`)}},f=[`ThemesOwn`,`Glow`,`Square`,`SelectOutline`,`BackToThemesOwn`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    style: "glow"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    style: "square"
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await expect(canvas.getByRole("radio", {
      name: "Theme's own"
    })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", {
      name: "Outline"
    }));
    await expect(args.onSelect).toHaveBeenCalledWith("outline");
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    style: "flat"
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole("radio", {
      name: "Theme's own"
    }));
    await expect(args.onSelect).toHaveBeenCalledWith("theme");
  }
}`,...d.parameters?.docs?.source}}}})))()}p();export{d as BackToThemesOwn,c as Glow,u as SelectOutline,l as Square,s as ThemesOwn,f as __namedExportsOrder,a as default};