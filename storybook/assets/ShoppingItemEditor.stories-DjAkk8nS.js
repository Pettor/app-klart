import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{c as t,t as n}from"./src-axRF29CE.js";import{n as r,t as i}from"./ShoppingItemEditor-nYuqVdyt.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{n(),r(),{expect:a,fn:o,screen:s}=__STORYBOOK_MODULE_TEST__,c={component:i,title:`Views/Shopping Item Editor`,tags:[`autodocs`],decorators:[t]},l={item:{id:`i1`,name:`Mjölk`,qty:2,price:25,link:null,note:``,category:`dairy`,bought:!1,important:!1,isInMyDay:!1},color:`green`,showCategory:!0,onChange:o(),onToggleBought:o(),onToggleImportant:o(),onToggleMyDay:o(),onRemove:o(),onClose:o()},u={args:l},d={args:{...l,showCategory:!1},play:async({canvas:e})=>{await a(e.queryByTestId(`shopping-item-editor__category`)).toBeNull()}},f={args:{...l,item:{...l.item,bought:!0}},play:async({canvas:e})=>{await a(e.queryByTestId(`shopping-item-editor__my-day`)).toBeNull()}},p={args:l,play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByTestId(`shopping-item-editor__name`);await n.clear(r),await n.type(r,`Havremjölk{Enter}`),await a(e.onChange).toHaveBeenCalledWith({name:`Havremjölk`})}},m={args:l,play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByTestId(`shopping-item-editor__name`);await n.clear(r),await n.tab(),await a(e.onChange).not.toHaveBeenCalled(),await a(r).toHaveValue(`Mjölk`)}},h={args:l,play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByTestId(`shopping-item-editor__qty`);await n.clear(r),await n.type(r,`1.5{Enter}`),await a(e.onChange).not.toHaveBeenCalled(),await a(t.getByText(`Enter a whole number, 1 or more.`)).toBeVisible(),await n.clear(r),await n.type(r,`3{Enter}`),await a(e.onChange).toHaveBeenCalledWith({qty:3});let i=t.getByTestId(`shopping-item-editor__price`);await n.clear(i),await n.type(i,`19,90{Enter}`),await a(e.onChange).toHaveBeenCalledWith({price:19.9}),await n.clear(i),await n.tab(),await a(e.onChange).toHaveBeenCalledWith({price:null})}},g={args:l,play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByTestId(`shopping-item-editor__link`);await n.type(r,`not a link{Enter}`),await a(e.onChange).not.toHaveBeenCalled(),await a(t.getByText(`Links must start with http://, https:// or www.`)).toBeVisible(),await n.clear(r),await n.type(r,`www.ica.se{Enter}`),await a(e.onChange).toHaveBeenCalledWith({link:`https://www.ica.se`})}},_={args:l,play:async({args:e,canvas:t,userEvent:n})=>{await n.type(t.getByTestId(`shopping-item-editor__note`),`Laktosfri`),await n.tab(),await a(e.onChange).toHaveBeenCalledWith({note:`Laktosfri`})}},v={args:l,play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByRole(`button`,{name:/Store section/})),await n.click(await s.findByRole(`option`,{name:`Pantry`})),await a(e.onChange).toHaveBeenCalledWith({category:`pantry`})}},y={args:l,play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByTestId(`shopping-item-editor__toggle`)),await a(e.onToggleBought).toHaveBeenCalled(),await n.click(t.getByTestId(`shopping-item-editor__important`)),await a(e.onToggleImportant).toHaveBeenCalled(),await n.click(t.getByTestId(`shopping-item-editor__my-day`)),await a(e.onToggleMyDay).toHaveBeenCalled(),await n.click(t.getByTestId(`shopping-item-editor__remove`)),await a(e.onRemove).toHaveBeenCalled(),await n.click(t.getByTestId(`shopping-item-editor__close`)),await a(e.onClose).toHaveBeenCalled()}},b=[`Default`,`NotGrocery`,`Bought`,`Rename`,`EmptyNameReverts`,`EditNumbers`,`EditLink`,`EditNote`,`PickStoreSection`,`ToggleActions`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    showCategory: false
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.queryByTestId("shopping-item-editor__category")).toBeNull();
  }
}`,...d.parameters?.docs?.source},description:{story:`Only grocery lists group by store section.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    item: {
      ...defaultArgs.item,
      bought: true
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.queryByTestId("shopping-item-editor__my-day")).toBeNull();
  }
}`,...f.parameters?.docs?.source},description:{story:`My Day doesn't take bought items, so the button goes.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    const name = canvas.getByTestId("shopping-item-editor__name");
    await userEvent.clear(name);
    await userEvent.type(name, "Havremjölk{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({
      name: "Havremjölk"
    });
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    const name = canvas.getByTestId("shopping-item-editor__name");
    await userEvent.clear(name);
    await userEvent.tab();
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(name).toHaveValue("Mjölk");
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    const qty = canvas.getByTestId("shopping-item-editor__qty");
    await userEvent.clear(qty);
    await userEvent.type(qty, "1.5{Enter}");
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getByText("Enter a whole number, 1 or more.")).toBeVisible();
    await userEvent.clear(qty);
    await userEvent.type(qty, "3{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({
      qty: 3
    });
    const price = canvas.getByTestId("shopping-item-editor__price");
    await userEvent.clear(price);
    await userEvent.type(price, "19,90{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({
      price: 19.9
    });
    await userEvent.clear(price);
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenCalledWith({
      price: null
    });
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    const link = canvas.getByTestId("shopping-item-editor__link");
    await userEvent.type(link, "not a link{Enter}");
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getByText("Links must start with http://, https:// or www.")).toBeVisible();
    await userEvent.clear(link);
    await userEvent.type(link, "www.ica.se{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({
      link: "https://www.ica.se"
    });
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.type(canvas.getByTestId("shopping-item-editor__note"), "Laktosfri");
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenCalledWith({
      note: "Laktosfri"
    });
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: /Store section/
    }));
    await userEvent.click(await screen.findByRole("option", {
      name: "Pantry"
    }));
    await expect(args.onChange).toHaveBeenCalledWith({
      category: "pantry"
    });
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByTestId("shopping-item-editor__toggle"));
    await expect(args.onToggleBought).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("shopping-item-editor__important"));
    await expect(args.onToggleImportant).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("shopping-item-editor__my-day"));
    await expect(args.onToggleMyDay).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("shopping-item-editor__remove"));
    await expect(args.onRemove).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("shopping-item-editor__close"));
    await expect(args.onClose).toHaveBeenCalled();
  }
}`,...y.parameters?.docs?.source}}}})))()}x();export{f as Bought,u as Default,g as EditLink,_ as EditNote,h as EditNumbers,m as EmptyNameReverts,d as NotGrocery,v as PickStoreSection,p as Rename,y as ToggleActions,b as __namedExportsOrder,c as default};