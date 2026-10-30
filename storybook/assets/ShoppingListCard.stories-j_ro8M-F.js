import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{c as t,t as n}from"./src-CdQSlvMR.js";import{n as r,t as i}from"./ShoppingListCard-Du_x2uDs.js";var a,o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{n(),r(),{expect:a,fn:o}=__STORYBOOK_MODULE_TEST__,s={component:i,title:`Display/Shopping List Card`,tags:[`autodocs`],decorators:[t]},c={today:`2026-10-28`,list:{id:`l1`,name:`Veckohandling`,kind:`grocery`,color:`green`,date:null,total:9,bought:2,isCompleted:!1,context:null},onPress:o()},l={args:c,play:async({canvas:e,args:t})=>{await a(e.getByText(`7 left`)).toBeVisible(),e.getByTestId(`shopping-list-card`).click(),await a(t.onPress).toHaveBeenCalledWith(`l1`)}},u={args:{...c,isSelected:!0}},d={args:{...c,list:{...c.list,name:`Adeles födelsedag`,kind:`gift`,color:`pink`,date:`2026-11-07`,total:4,bought:1}}},f={args:{...c,list:{...c.list,bought:9}},play:async({canvas:e})=>{await a(e.getByText(`All bought`)).toBeVisible()}},p={args:{...c,list:{...c.list,total:0,bought:0}},play:async({canvas:e})=>{await a(e.getByText(`No items yet`)).toBeVisible()}},m={args:{...c,list:{...c.list,name:`Fredagsmys`,total:4,bought:3,isCompleted:!0}},play:async({canvas:e})=>{await a(e.getByText(`3 of 4 bought`)).toBeVisible()}},h={args:{...c,list:{...c.list,context:{name:`Work`,color:`orange`}}},play:async({canvas:e})=>{await a(e.getByTestId(`shopping-list-card__context`)).toHaveTextContent(`Work`)}},g={args:{...c,list:{...c.list,total:4,bought:3,isCompleted:!0,context:{name:`Personal`,color:`blue`}}},play:async({canvas:e})=>{await a(e.getByTestId(`shopping-list-card__context`)).toHaveTextContent(`Personal`)}},_=[`Default`,`Selected`,`GiftWithDate`,`AllBought`,`Empty`,`Completed`,`WithContext`,`CompletedWithContext`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    canvas,
    args
  }) => {
    await expect(canvas.getByText("7 left")).toBeVisible();
    canvas.getByTestId("shopping-list-card").click();
    await expect(args.onPress).toHaveBeenCalledWith("l1");
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    isSelected: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    list: {
      ...defaultArgs.list,
      name: "Adeles födelsedag",
      kind: "gift",
      color: "pink",
      date: "2026-11-07",
      total: 4,
      bought: 1
    }
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    list: {
      ...defaultArgs.list,
      bought: 9
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByText("All bought")).toBeVisible();
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    list: {
      ...defaultArgs.list,
      total: 0,
      bought: 0
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByText("No items yet")).toBeVisible();
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    list: {
      ...defaultArgs.list,
      name: "Fredagsmys",
      total: 4,
      bought: 3,
      isCompleted: true
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByText("3 of 4 bought")).toBeVisible();
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    list: {
      ...defaultArgs.list,
      context: {
        name: "Work",
        color: "orange"
      }
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByTestId("shopping-list-card__context")).toHaveTextContent("Work");
  }
}`,...h.parameters?.docs?.source},description:{story:`Under "All contexts" the card shows which context the list belongs to.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    list: {
      ...defaultArgs.list,
      total: 4,
      bought: 3,
      isCompleted: true,
      context: {
        name: "Personal",
        color: "blue"
      }
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByTestId("shopping-list-card__context")).toHaveTextContent("Personal");
  }
}`,...g.parameters?.docs?.source}}}})))()}v();export{f as AllBought,m as Completed,g as CompletedWithContext,l as Default,p as Empty,d as GiftWithDate,u as Selected,h as WithContext,_ as __namedExportsOrder,s as default};