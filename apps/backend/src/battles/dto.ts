import { IsObject } from "class-validator";
import type { Formation } from "@battle-formation/shared-types";

// This only checks that `formation` is an object - the actual rules (col/
// row bounds, unique instanceIds, exactly 6 heroes) are enforced by
// game-engine's validateFormation inside BattlesService.submitFormation,
// reusing the identical check the client runs to gate its own "Confirm
// Formation" button, rather than duplicating those rules in a second
// class-validator schema that could drift from it.
export class SubmitFormationDto {
  @IsObject()
  formation: Formation;
}
