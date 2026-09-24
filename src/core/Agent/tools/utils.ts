import { execSync } from "child_process";
import * as os from "os";
import { parse } from "csv-parse/sync";
import { extract } from "fuzzball";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function executeCommand(command: string): [string, number] {
  try {
    // Encode command to base64 (UTF-16LE)
    const fullCommand = `$ProgressPreference = 'SilentlyContinue'; ${command}`;

    const encoded = Buffer.from(fullCommand, "utf16le").toString("base64");

    // Execute PowerShell command
    const result = execSync(
      `powershell -NoProfile -EncodedCommand ${encoded}`,
      {
        encoding: "buffer",
        timeout: 25000, // 25 seconds in milliseconds
        cwd: os.homedir(),
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      }
    );

    const stdout = result.toString();

    return [stdout, 0];
  } catch (error: any) {
    if (error.killed && error.signal === "SIGTERM") {
      // Timeout occurred
      return ["Command execution timed out", 1];
    }

    // Command failed but may have output
    const output = error.stdout
      ? error.stdout.toString()
      : error.stderr
      ? error.stderr.toString()
      : "Command execution failed";

    const returnCode = error.status || 1;
    return [output, returnCode];
  }
}

// export function getAppsFromStartMenu(): Record<string, string> {
//   const command = "Get-StartApps | ConvertTo-Csv -NoTypeInformation";
//   const [appsInfo, _] = executeCommand(command);

//   const records = parse(appsInfo, {
//     columns: true, // Use first row as headers
//     skip_empty_lines: true,
//     trim: true,
//   }) as { Name?: string; AppID?: string }[];

//   const apps: Record<string, string> = {};
//   for (const row of records) {
//     const name = row["Name"]?.toLowerCase();
//     const appId = row["AppID"];
//     if (name && appId) {
//       apps[name] = appId;
//     }
//   }
//   console.log(apps);
//   return apps;
// }

// export function launchApp(name: string): [string, number] {
//   const appsMap = getAppsFromStartMenu();

//   // extract returns an array of matches: [[choice, score, index], ...]
//   // We want the first (best) match
//   const matches = extract(name, Object.keys(appsMap), {
//     limit: 1, // Get only 1 result
//     cutoff: 70, // Minimum score threshold
//   });

//   // Check if we got any matches
//   if (!matches || matches.length === 0) {
//     return [
//       `${
//         name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
//       } not found in start menu.`,
//       1,
//     ];
//   }

//   // Extract returns: [['appName', score, index]]
//   const [appName, _score, _index] = matches[0];
//   const appid = appsMap[appName];

//   if (appid === undefined) {
//     return [
//       `${
//         name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
//       } not found in start menu.`,
//       1,
//     ];
//   }
//   let response: string;
//   let status: number;

//   if (name.endsWith(".exe")) {
//     [response, status] = executeCommand(`Start-Process ${appid}`);
//   } else {
//     [response, status] = executeCommand(
//       `Start-Process shell:AppsFolder\\${appid}`
//     );
//   }
//   return [response, status];
// }
