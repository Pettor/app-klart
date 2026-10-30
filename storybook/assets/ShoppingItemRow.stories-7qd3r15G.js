import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./ShoppingItemRow-DScptPMt.js";import{c as r,t as i}from"./src-CdQSlvMR.js";var a,o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{i(),t(),{expect:a,fn:o,waitFor:s}=__STORYBOOK_MODULE_TEST__,c={component:n,title:`Display/Shopping Item Row`,tags:[`autodocs`],decorators:[r]},l={item:{id:`i1`,name:`Mjölk`,qty:2,total:null,link:null,note:``,bought:!1,important:!1,isInMyDay:!1},onToggleBought:o(),onToggleImportant:o(),onToggleMyDay:o(),onRemove:o()},u={args:l,play:async({canvas:e,args:t})=>{await a(e.getByText(`× 2`)).toBeVisible(),e.getByTestId(`shopping-item__my-day`).click(),await a(t.onToggleMyDay).toHaveBeenCalledWith(`i1`)}},d={args:{...l,item:{...l.item,name:`Kattmat och sand`,qty:null,important:!0,isInMyDay:!0}},play:async({canvas:e})=>{await a(e.getByTestId(`shopping-item__my-day`)).toHaveAccessibleName(`In My Day, press to remove`)}},f={args:{...l,item:{...l.item,name:`LEGO Friends set`,qty:null,total:499,link:`https://www.lekia.se/`}},play:async({canvas:e})=>{await a(e.getByText(`499 kr`)).toBeVisible(),await a(e.getByTestId(`shopping-item__link`)).toHaveAccessibleName(`Open LEGO Friends set on lekia.se`)}},p={args:{...l,item:{...l.item,bought:!0}}},m={args:l,play:async({canvas:e,args:t})=>{e.getByTestId(`shopping-item__toggle`).click(),await s(()=>a(t.onToggleBought).toHaveBeenCalledWith(`i1`,!0),{timeout:2e3})}},h=[`Default`,`InMyDay`,`WithPriceAndLink`,`Bought`,`CheckOff`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
      name: "Kattmat och sand",
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
      name: "LEGO Friends set",
      qty: null,
      total: 499,
      link: "https://www.lekia.se/"
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByText("499 kr")).toBeVisible();
    await expect(canvas.getByTestId("shopping-item__link")).toHaveAccessibleName("Open LEGO Friends set on lekia.se");
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
}`,...m.parameters?.docs?.source}}}})))()}g();export{p as Bought,m as CheckOff,u as Default,d as InMyDay,f as WithPriceAndLink,h as __namedExportsOrder,c as default};