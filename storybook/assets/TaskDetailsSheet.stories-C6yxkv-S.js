import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./TaskDetailsSheet--b116WUp.js";var r,i,a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{t(),{expect:r,fn:i,screen:a,waitFor:o,within:s}=__STORYBOOK_MODULE_TEST__,c={component:n,title:`Display/Task Details Sheet`,tags:[`autodocs`],globals:{viewport:{value:`iphonex`}}},l={today:`2026-10-21`,task:{id:`p1`,title:`Beställ: Algot utehus och extra hyllplan till förrådet, kolla leveranstid innan helgen`,done:!1,important:!0,due:`2026-10-20`,remindAt:`2026-10-21T17:30`,tags:[`hem`,`köp`,`förråd`],links:[`https://www.ikea.com/se/sv/p/algot-utehus`,`https://www.ikea.com/se/sv/p/hyllplan`],hasNotes:!0,notes:`Mät förrådsväggen först: 120 cm bred.
Hämta hellre än leverans om tiden är över en vecka.`,isInMyDay:!0,contextName:`Personal`,contextColor:`blue`},onClose:i(),onToggleDone:i(),onToggleImportant:i(),onAddToMyDay:i(),onRemoveFromMyDay:i(),onEdit:i()},u={args:l,play:async()=>{let e=s(await a.findByTestId(`task-details`));await r(e.getByTestId(`task-details__title`)).toHaveTextContent(l.task.title),await r(e.getAllByTestId(`task-links__link`)).toHaveLength(2),await r(e.getByTestId(`task-details__note`)).toHaveTextContent(`120 cm bred`),await r(e.getByText(`#förråd`)).toBeInTheDocument()}},d={args:l,play:async({args:e,userEvent:t})=>{await t.click(await a.findByTestId(`task-details__toggle`)),await r(e.onToggleDone).not.toHaveBeenCalled(),await o(()=>r(e.onToggleDone).toHaveBeenCalledWith(`p1`,!0)),await r(e.onClose).toHaveBeenCalled()}},f={args:l,play:async({args:e,userEvent:t})=>{await t.click(await a.findByTestId(`task-details__important`)),await r(e.onToggleImportant).toHaveBeenCalledWith(`p1`),await t.click(a.getByTestId(`task-details__edit`)),await r(e.onEdit).toHaveBeenCalledWith(`p1`),await t.click(a.getByTestId(`task-details__my-day`)),await r(e.onRemoveFromMyDay).toHaveBeenCalledWith(`p1`),await r(e.onClose).toHaveBeenCalled()}},p={args:{...l,task:{...l.task,title:`Boka Body pump`,important:!1,due:null,remindAt:null,tags:[],links:[],hasNotes:!1,notes:``,isInMyDay:!1}},play:async({args:e,userEvent:t})=>{let n=s(await a.findByTestId(`task-details`));await r(n.queryByTestId(`task-details__links`)).toBeNull(),await r(n.queryByTestId(`task-details__note`)).toBeNull(),await t.click(n.getByRole(`button`,{name:`Add to My Day`})),await r(e.onAddToMyDay).toHaveBeenCalledWith(`p1`)}},m=[`Default`,`Complete`,`Actions`,`NotInMyDay`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async () => {
    const sheet = within(await screen.findByTestId("task-details"));
    await expect(sheet.getByTestId("task-details__title")).toHaveTextContent(defaultArgs.task.title);
    await expect(sheet.getAllByTestId("task-links__link")).toHaveLength(2);
    await expect(sheet.getByTestId("task-details__note")).toHaveTextContent("120 cm bred");
    await expect(sheet.getByText("#förråd")).toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source},description:{story:`The whole title, pills, links, the note and the actions the lean row leaves out.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    userEvent
  }) => {
    await userEvent.click(await screen.findByTestId("task-details__toggle"));
    await expect(args.onToggleDone).not.toHaveBeenCalled();
    await waitFor(() => expect(args.onToggleDone).toHaveBeenCalledWith("p1", true));
    await expect(args.onClose).toHaveBeenCalled();
  }
}`,...d.parameters?.docs?.source},description:{story:`Completing from the sheet animates the check, then marks the task done and closes the sheet.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    userEvent
  }) => {
    await userEvent.click(await screen.findByTestId("task-details__important"));
    await expect(args.onToggleImportant).toHaveBeenCalledWith("p1");
    await userEvent.click(screen.getByTestId("task-details__edit"));
    await expect(args.onEdit).toHaveBeenCalledWith("p1");
    await userEvent.click(screen.getByTestId("task-details__my-day"));
    await expect(args.onRemoveFromMyDay).toHaveBeenCalledWith("p1");
    await expect(args.onClose).toHaveBeenCalled();
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      title: "Boka Body pump",
      important: false,
      due: null,
      remindAt: null,
      tags: [],
      links: [],
      hasNotes: false,
      notes: "",
      isInMyDay: false
    }
  },
  play: async ({
    args,
    userEvent
  }) => {
    const sheet = within(await screen.findByTestId("task-details"));
    await expect(sheet.queryByTestId("task-details__links")).toBeNull();
    await expect(sheet.queryByTestId("task-details__note")).toBeNull();
    await userEvent.click(sheet.getByRole("button", {
      name: "Add to My Day"
    }));
    await expect(args.onAddToMyDay).toHaveBeenCalledWith("p1");
  }
}`,...p.parameters?.docs?.source},description:{story:`A task outside My Day, with nothing but a title: no links or note sections, and an Add button.`,...p.parameters?.docs?.description}}}})))()}h();export{f as Actions,d as Complete,u as Default,p as NotInMyDay,m as __namedExportsOrder,c as default};