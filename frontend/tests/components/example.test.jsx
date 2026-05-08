import { render, screen } from "@testing-library/react";

describe("Button Component", () => {
    it("should render", () => {
        const Button = () => <button>Click</button>;
        render(<Button />);
        expect(screen.getByText("Click")).toBeInTheDocument();
    });
});
