import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-Q1GcV6wX.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./SearchField-BHFjiMYC.js";import{c as a,t as o}from"./src-CdQSlvMR.js";function s({placeholder:e,initialValue:t=``,shortcutHint:n,tags:r}){let[a,o]=(0,c.useState)(t);return(0,l.jsx)(i,{ariaLabel:`Search`,value:a,onChange:o,placeholder:e,shortcutHint:n,tags:r,className:`w-64`})}var c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{c=t(),o(),r(),l=n(),{expect:u}=__STORYBOOK_MODULE_TEST__,d={component:s,title:`Input/Search Field`,tags:[`autodocs`],decorators:[a]},f={args:{placeholder:`Search…`}},p={args:{placeholder:`Search…`,initialValue:`invoice`}},m={args:{placeholder:`Search…`,shortcutHint:`/`}},h={args:{placeholder:`Search or #tag`,tags:[`acme`,`review`,`hem`,`release`,`docs`]},play:async({canvas:e,userEvent:t})=>{let n=e.getByRole(`searchbox`);await t.type(n,`#re`);let r=e.getAllByTestId(`search-field__tag-suggestion`);await u(r.map(e=>e.textContent)).toEqual([`#review`,`#release`]),await t.keyboard(`{ArrowDown}{Enter}`),await u(n).toHaveValue(`#release `),await u(e.queryByTestId(`search-field__tag-suggestions`)).toBeNull(),await t.type(n,`#`),await t.keyboard(`{Escape}`),await u(e.queryByTestId(`search-field__tag-suggestions`)).toBeNull(),await u(n).toHaveValue(`#release #`),await t.type(n,`d`),await t.click(e.getByText(`docs`)),await u(n).toHaveValue(`#release #docs `)}},g=[`Default`,`WithValue`,`WithShortcutHint`,`WithTagSuggestions`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Search…"
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Search…",
    initialValue: "invoice"
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Search…",
    shortcutHint: "/"
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Search or #tag",
    tags: ["acme", "review", "hem", "release", "docs"]
  },
  play: async ({
    canvas,
    userEvent
  }) => {
    const input = canvas.getByRole("searchbox");
    await userEvent.type(input, "#re");
    const suggestions = canvas.getAllByTestId("search-field__tag-suggestion");
    await expect(suggestions.map(item => item.textContent)).toEqual(["#review", "#release"]);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(input).toHaveValue("#release ");
    await expect(canvas.queryByTestId("search-field__tag-suggestions")).toBeNull();
    await userEvent.type(input, "#");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByTestId("search-field__tag-suggestions")).toBeNull();
    await expect(input).toHaveValue("#release #");
    await userEvent.type(input, "d");
    await userEvent.click(canvas.getByText("docs"));
    await expect(input).toHaveValue("#release #docs ");
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{f as Default,m as WithShortcutHint,h as WithTagSuggestions,p as WithValue,g as __namedExportsOrder,d as default};