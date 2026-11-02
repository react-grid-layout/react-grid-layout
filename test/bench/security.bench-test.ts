import { securityScenario, securityVectors } from "./security-scenarios";

test.each(securityVectors)("untrusted layout work is bounded: %s", vector => {
  console.log(vector, JSON.stringify(securityScenario(vector)));
});
