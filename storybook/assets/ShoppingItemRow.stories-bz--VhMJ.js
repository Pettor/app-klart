import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./ShoppingItemRow--QXToQCv.js";import{c as r,t as i}from"./src-axRF29CE.js";var a,o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{i(),t(),{expect:a,fn:o,waitFor:s}=__STORYBOOK_MODULE_TEST__,c={component:n,title:`Display/Shopping Item Row`,tags:[`autodocs`],decorators:[r]},l={item:{id:`i1`,name:`Mjölk`,qty:2,total:null,link:null,note:``,bought:!1,important:!1,isInMyDay:!1},onToggleBought:o(),onToggleImportant:o(),onToggleMyDay:o(),onRemove:o()},u={args:l,play:async({canvas:e,args:t})=>{await a(e.getByText(`× 2`)).toBeVisible(),e.getByTestId(`shopping-item__my-day`).click(),await a(t.onToggleMyDay).toHaveBeenCalledWith(`i1`)}},d={args:{...l,item:{...l.item,name:`Kaffe och filter`,qty:null,important:!0,isInMyDay:!0}},play:async({canvas:e})=>{await a(e.getByTestId(`shopping-item__my-day`)).toHaveAccessibleName(`In My Day, press to remove`)}},f={args:{...l,item:{...l.item,name:`Brädspel`,qty:null,total:499,link:`https://example.com/`}},play:async({canvas:e})=>{await a(e.getByText(`499 kr`)).toBeVisible(),await a(e.getByTestId(`shopping-item__link`)).toHaveAccessibleName(`Open Brädspel on example.com`)}},p={args:{...l,item:{...l.item,bought:!0}}},m={args:{...l,onOpen:o(),isSelected:!0},play:async({canvas:e,args:t})=>{e.getByRole(`button`,{name:`Edit item: Mjölk`}).click(),await a(t.onOpen).toHaveBeenCalledWith(`i1`)}},h={args:l,play:async({canvas:e,args:t})=>{e.getByTestId(`shopping-item__toggle`).click(),await s(()=>a(t.onToggleBought).toHaveBeenCalledWith(`i1`,!0),{timeout:2e3})}},g=[`Default`,`InMyDay`,`WithPriceAndLink`,`Bought`,`OpensEditor`,`CheckOff`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    canvas,
    args
  }) => {
    await expect(canvas.getByText("× 2")).toBeVisible();
    canvas.getByTestId("shopping-item__my-day").click();
    await expect(args.onToggleMyDay).toHaveBeenCalledWith("i1");
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    item: {
      ...defaultArgs.item,
      name: "Kaffe och filter",
      qty: null,
      important: true,
      isInMyDay: true
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByTestId("shopping-item__my-day")).toHaveAccessibleName("In My Day, press to remove");
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    item: {
      ...defaultArgs.item,
      name: "Brädspel",
      qty: null,
      total: 499,
      link: "https://example.com/"
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByText("499 kr")).toBeVisible();
    await expect(canvas.getByTestId("shopping-item__link")).toHaveAccessibleName("Open Brädspel on example.com");
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    item: {
      ...defaultArgs.item,
      bought: true
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    onOpen: fn(),
    isSelected: true
  },
  play: async ({
    canvas,
    args
  }) => {
    canvas.getByRole("button", {
      name: "Edit item: Mjölk"
    }).click();
    await expect(args.onOpen).toHaveBeenCalledWith("i1");
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    canvas,
    args
  }) => {
    canvas.getByTestId("shopping-item__toggle").click();
    await waitFor(() => expect(args.onToggleBought).toHaveBeenCalledWith("i1", true), {
      timeout: 2000
    });
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{p as Bought,h as CheckOff,u as Default,d as InMyDay,m as OpensEditor,f as WithPriceAndLink,g as __namedExportsOrder,c as default};