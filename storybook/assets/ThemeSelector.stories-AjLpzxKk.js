import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./ThemeSelector-D2oWVyWM.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{t(),{expect:r,fn:i}=__STORYBOOK_MODULE_TEST__,a={component:n,title:`Actions/Theme Selector`},o={mode:`auto`,onSelect:e=>console.log(`Selected:`,e)},s={args:o},c={args:{...o,mode:`light`}},l={args:{...o,mode:`dark`}},u={args:o,play:async({canvas:e,userEvent:t})=>{let n=e.getByRole(`radio`,{name:`Light`});await r(n).toBeInTheDocument(),await t.click(n)}},d={args:{...o,mode:`light`},play:async({canvas:e,userEvent:t})=>{let n=e.getByRole(`radio`,{name:`Dark`});await r(n).toBeInTheDocument(),await t.click(n)}},f={args:{...o,mode:`midnight`}},p={args:{...o,mode:`dark`,onSelect:i()},play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByRole(`radio`,{name:`Midnight`})),await r(e.onSelect).toHaveBeenCalledWith(`midnight`)}},m={args:{...o,mode:`paper`}},h={args:{...o,mode:`bloom`}},g={args:{...o,mode:`graphite`}},_={args:{...o,mode:`vivid`}},v={args:{...o,mode:`light`,onSelect:i()},play:async({args:e,canvas:t,userEvent:n})=>{for(let[i,a]of[[`Paper`,`paper`],[`Bloom`,`bloom`],[`Graphite`,`graphite`],[`Vivid`,`vivid`]])await n.click(t.getByRole(`radio`,{name:i})),await r(e.onSelect).toHaveBeenCalledWith(a)}},y=[`Auto`,`Light`,`Dark`,`SelectLight`,`SelectDark`,`Midnight`,`SelectMidnight`,`Paper`,`Bloom`,`Graphite`,`Vivid`,`SelectNewThemes`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    mode: "light"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    mode: "dark"
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    canvas,
    userEvent
  }) => {
    const lightOption = canvas.getByRole("radio", {
      name: "Light"
    });
    await expect(lightOption).toBeInTheDocument();
    await userEvent.click(lightOption);
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    mode: "light"
  },
  play: async ({
    canvas,
    userEvent
  }) => {
    const darkOption = canvas.getByRole("radio", {
      name: "Dark"
    });
    await expect(darkOption).toBeInTheDocument();
    await userEvent.click(darkOption);
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    mode: "midnight"
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    mode: "dark",
    onSelect: fn()
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole("radio", {
      name: "Midnight"
    }));
    await expect(args.onSelect).toHaveBeenCalledWith("midnight");
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    mode: "paper"
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    mode: "bloom"
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    mode: "graphite"
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    mode: "vivid"
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    mode: "light",
    onSelect: fn()
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    for (const [name, mode] of [["Paper", "paper"], ["Bloom", "bloom"], ["Graphite", "graphite"], ["Vivid", "vivid"]] as const) {
      await userEvent.click(canvas.getByRole("radio", {
        name
      }));
      await expect(args.onSelect).toHaveBeenCalledWith(mode);
    }
  }
}`,...v.parameters?.docs?.source}}}})))()}b();export{s as Auto,h as Bloom,l as Dark,g as Graphite,c as Light,f as Midnight,m as Paper,d as SelectDark,u as SelectLight,p as SelectMidnight,v as SelectNewThemes,_ as Vivid,y as __namedExportsOrder,a as default};