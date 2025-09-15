import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

const tag = process.argv[2] || "latest";

try {
  // Update versions based on changesets
  run("pnpm changeset version");
  run("pnpm install -r");
  run("git add -A");
  run('git commit -m "chore: release" || true');
  run("git push");
  // Publish packages to npm under provided tag
  run(`pnpm changeset publish --tag ${tag}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
