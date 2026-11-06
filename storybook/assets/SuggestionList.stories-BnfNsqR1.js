import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./SuggestionList-Dnlp-07e.js";function i(e,t,n){return{id:e,title:t,contextColor:`blue`,contextName:`Personal`,important:!1,tags:[],reason:`recently_added`,why:{type:`no_date`},kinds:[],...n}}var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{n(),a=t(),{expect:o,fn:s,waitFor:c,within:l}=__STORYBOOK_MODULE_TEST__,u={component:r,title:`Display/Suggestion List`,tags:[`autodocs`],decorators:[e=>(0,a.jsx)(`div`,{className:`ctx-blue bg-surface w-[340px] p-4`,children:(0,a.jsx)(e,{})})]},d={items:[i(`p4`,`Byt munstycke tandborste`,{reason:`overdue`,why:{type:`overdue`,days:3},kinds:[`overdue`,`important`],important:!0,tags:[`hem`]}),i(`p5`,`Köp: Kaffe och filter`,{reason:`due_today`,why:{type:`due_today`},kinds:[`soon`],tags:[`köp`]}),i(`p6`,`Hem: fixa knarrande dörr`,{reason:`left_from_yesterday`,why:{type:`left_from_yesterday`},kinds:[`soon`],tags:[`hem`]}),i(`p3`,`Vattna blommorna`,{reason:`overdue`,why:{type:`stale`,days:54},kinds:[`overdue`],tags:[`hem`]}),i(`p7`,`Boka tandläkare`,{reason:`coming_up`,why:{type:`due_in`,days:2},kinds:[`soon`]}),i(`p8`,`Rensa garaget`,{reason:`related_to_today`,why:{type:`goes_with_today`,tag:`hem`},kinds:[`related`],tags:[`hem`]}),i(`p9`,`Läs boken`,{})],urgentCount:2,dueCount:3,snoozedCount:0,onAdd:s(),onAddAllDue:s(),onSnooze:s(),onUndoSnooze:s()},f={args:d},p={args:{...d,items:[],urgentCount:0,dueCount:0},play:async({canvas:e})=>{await o(e.getByText(/All caught up/)).toBeVisible(),await o(e.queryByTestId(`suggestion-list__add-all-due`)).toBeNull()}},m={args:{...d,snoozedCount:2},play:async({args:e,canvas:t,userEvent:n})=>{await o(t.getByText(`2 hidden until tomorrow`)).toBeVisible(),await n.click(t.getByTestId(`suggestion-list__undo-snooze`)),await o(e.onUndoSnooze).toHaveBeenCalled()}},h={args:d,play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByTestId(`suggestion-list__top-pick-add`);await n.click(r),await o(e.onAdd).not.toHaveBeenCalled(),await o(r.closest(`.slab-leave`)).toHaveClass(`slab-leaving`),await c(()=>o(e.onAdd).toHaveBeenCalledWith(`p4`,`overdue`)),await n.click(t.getByRole(`button`,{name:`Add Köp: Kaffe och filter to My Day`})),await c(()=>o(e.onAdd).toHaveBeenCalledWith(`p5`,`due_today`)),await n.click(t.getByTestId(`suggestion-list__add-all-due`)),await c(()=>o(e.onAddAllDue).toHaveBeenCalled())}},g={args:d,play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByTestId(`suggestion-list__top-pick-snooze`)),await o(e.onSnooze).toHaveBeenCalledWith(`p4`),await n.click(t.getByRole(`button`,{name:`Not today: Köp: Kaffe och filter`})),await o(e.onSnooze).toHaveBeenCalledWith(`p5`)}},_={args:d,play:async({canvas:e,userEvent:t})=>{let n=e.getByRole(`article`,{name:`Top pick`});await o(l(n).getByText(`Byt munstycke tandborste`)).toBeVisible(),await o(e.queryByText(`Läs boken`)).toBeNull(),await t.click(e.getByTestId(`suggestion-list__filter-overdue`)),await o(e.queryByRole(`article`,{name:`Top pick`})).toBeNull(),await o(e.getByText(`Overdue 54 days, still relevant?`)).toBeVisible(),await o(e.queryByText(`Köp: Kaffe och filter`)).toBeNull(),await t.click(e.getByTestId(`suggestion-list__toggle-search`));let r=e.getByRole(`searchbox`,{name:`Find a task to add`});await t.type(r,`#köp`),await o(e.getByText(`Matches`)).toBeVisible(),await o(e.getByText(`Köp: Kaffe och filter`)).toBeVisible(),await t.clear(r),await t.type(r,`xyz`),await o(e.getByText(`No open task matches "xyz".`)).toBeVisible()}},v={args:d,play:async({canvas:e,userEvent:t})=>{await t.click(e.getByTestId(`suggestion-list__more`)),await o(e.getByText(`Läs boken`)).toBeVisible(),await t.click(e.getByTestId(`suggestion-list__fewer`)),await o(e.queryByText(`Läs boken`)).toBeNull()}},y=[`Default`,`Empty`,`Snoozed`,`AddSuggestion`,`SnoozeSuggestion`,`FilterAndFind`,`ShowMore`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    items: [],
    urgentCount: 0,
    dueCount: 0
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByText(/All caught up/)).toBeVisible();
    await expect(canvas.queryByTestId("suggestion-list__add-all-due")).toBeNull();
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    snoozedCount: 2
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await expect(canvas.getByText("2 hidden until tomorrow")).toBeVisible();
    await userEvent.click(canvas.getByTestId("suggestion-list__undo-snooze"));
    await expect(args.onUndoSnooze).toHaveBeenCalled();
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    const add = canvas.getByTestId("suggestion-list__top-pick-add");
    await userEvent.click(add);
    // The card slides out of the panel before the task is added.
    await expect(args.onAdd).not.toHaveBeenCalled();
    await expect(add.closest(".slab-leave")).toHaveClass("slab-leaving");
    await waitFor(() => expect(args.onAdd).toHaveBeenCalledWith("p4", "overdue"));
    await userEvent.click(canvas.getByRole("button", {
      name: "Add Köp: Kaffe och filter to My Day"
    }));
    await waitFor(() => expect(args.onAdd).toHaveBeenCalledWith("p5", "due_today"));
    await userEvent.click(canvas.getByTestId("suggestion-list__add-all-due"));
    await waitFor(() => expect(args.onAddAllDue).toHaveBeenCalled());
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByTestId("suggestion-list__top-pick-snooze"));
    await expect(args.onSnooze).toHaveBeenCalledWith("p4");
    await userEvent.click(canvas.getByRole("button", {
      name: "Not today: Köp: Kaffe och filter"
    }));
    await expect(args.onSnooze).toHaveBeenCalledWith("p5");
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    canvas,
    userEvent
  }) => {
    const topPick = canvas.getByRole("article", {
      name: "Top pick"
    });
    await expect(within(topPick).getByText("Byt munstycke tandborste")).toBeVisible();
    await expect(canvas.queryByText("Läs boken")).toBeNull();

    // A filter drops the top pick and lists everything of that kind.
    await userEvent.click(canvas.getByTestId("suggestion-list__filter-overdue"));
    await expect(canvas.queryByRole("article", {
      name: "Top pick"
    })).toBeNull();
    await expect(canvas.getByText("Overdue 54 days, still relevant?")).toBeVisible();
    await expect(canvas.queryByText("Köp: Kaffe och filter")).toBeNull();
    await userEvent.click(canvas.getByTestId("suggestion-list__toggle-search"));
    const search = canvas.getByRole("searchbox", {
      name: "Find a task to add"
    });
    await userEvent.type(search, "#köp");
    await expect(canvas.getByText("Matches")).toBeVisible();
    await expect(canvas.getByText("Köp: Kaffe och filter")).toBeVisible();
    await userEvent.clear(search);
    await userEvent.type(search, "xyz");
    await expect(canvas.getByText('No open task matches "xyz".')).toBeVisible();
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByTestId("suggestion-list__more"));
    await expect(canvas.getByText("Läs boken")).toBeVisible();
    await userEvent.click(canvas.getByTestId("suggestion-list__fewer"));
    await expect(canvas.queryByText("Läs boken")).toBeNull();
  }
}`,...v.parameters?.docs?.source}}}})))()}b();export{h as AddSuggestion,f as Default,p as Empty,_ as FilterAndFind,v as ShowMore,g as SnoozeSuggestion,m as Snoozed,y as __namedExportsOrder,u as default};