import { describe, expect, it } from "vitest";
import { isProfileEmpty } from "./profile";

const empty = { goals: "", current_situation: "", constraints: "" };

describe("isProfileEmpty", () => {
  it("considera vazio quando não há perfil", () => {
    expect(isProfileEmpty(null)).toBe(true);
  });

  it("considera vazio quando os campos só têm espaços", () => {
    expect(isProfileEmpty({ ...empty, goals: "   " })).toBe(true);
  });

  it("não é vazio com um campo preenchido", () => {
    expect(isProfileEmpty({ ...empty, constraints: "pouco tempo" })).toBe(false);
  });
});
