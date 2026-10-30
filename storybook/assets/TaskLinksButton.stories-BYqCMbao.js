import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{c as t,t as n}from"./src-CdQSlvMR.js";import{n as r,t as i}from"./TaskLinksButton-BUvbzy8B.js";var a,o,s,c,l,u,d;function f(){return(f=e((()=>{n(),r(),{expect:a,within:o}=__STORYBOOK_MODULE_TEST__,s={component:i,title:`Display/Task Links Button`,tags:[`autodocs`],decorators:[t]},c={title:`Review sync PR for gateway client and update the release notes before the Friday deploy`,links:[`https://github.com/acme/gateway-client/pull/412`,`https://www.notion.so/acme/Gateway-sync-spec-9f2c`,`https://wiki.acme.dev/release-notes`],variant:`popover`},l={args:c,play:async({canvas:e,userEvent:t})=>{await t.click(e.getByRole(`button`,{name:`3 links`}));let n=await o(document.body).findAllByTestId(`task-links__link`);await a(n).toHaveLength(3),await a(n[0]).toHaveAttribute(`href`,`https://github.com/acme/gateway-client/pull/412`),await a(n[0]).toHaveAttribute(`target`,`_blank`),await a(n[1]).toHaveTextContent(`notion.so`)}},u={args:{...c,variant:`sheet`},play:async({canvas:e,userEvent:t})=>{await t.click(e.getByRole(`button`,{name:`3 links`}));let n=o(document.body);await a(await n.findByRole(`dialog`,{name:`3 links`})).toBeInTheDocument(),await a(await n.findAllByTestId(`task-links__link`)).toHaveLength(3)}},d=[`Popover`,`Sheet`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: "3 links"
    }));
    const body = within(document.body);
    const links = await body.findAllByTestId("task-links__link");
    await expect(links).toHaveLength(3);
    await expect(links[0]).toHaveAttribute("href", "https://github.com/acme/gateway-client/pull/412");
    await expect(links[0]).toHaveAttribute("target", "_blank");
    await expect(links[1]).toHaveTextContent("notion.so");
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    variant: "sheet"
  },
  play: async ({
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: "3 links"
    }));
    const body = within(document.body);
    await expect(await body.findByRole("dialog", {
      name: "3 links"
    })).toBeInTheDocument();
    await expect(await body.findAllByTestId("task-links__link")).toHaveLength(3);
  }
}`,...u.parameters?.docs?.source},description:{story:`On phones the links open in a bottom sheet.`,...u.parameters?.docs?.description}}}})))()}f();export{l as Popover,u as Sheet,d as __namedExportsOrder,s as default};