import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import GroupList from "./GroupList";

const groups = [
  {
    id: "1",
    name: "Testowa grupa",
    adminId: "1",
    members: [
      {
        id: "1",
        familyName: "Ipsum",
        givenName: "Lorem",
        name: "Lorem Ipsum",
        nickname: "loremipsum",
        picture:
          "https://doodleipsum.com/700/avatar-2?i=c3ad02b4c56a73d312f9ea35ec8bcee8",
        email: "lorem@ipsum.com",
        groups: [],
        balance: "0.00",
      },
    ],
    debts: [],
    createdAt: new Date("2022-12-08T18:04:43.597Z"),
    updatedAt: new Date("2022-12-08T18:04:43.597Z"),
  },
];

test("should render not in any group yet", async () => {
  render(<GroupList groups={[]} />);

  const placeholderText = screen.getByText(
    "Nie należysz jeszcze do żadnej grupy"
  );
  expect(placeholderText).toBeInTheDocument();
});

test("should render group", async () => {
  render(
    <MemoryRouter>
      <GroupList groups={groups} />
    </MemoryRouter>
  );

  const groupName = await screen.getByText("Testowa grupa");
  expect(groupName).toBeInTheDocument();
});
