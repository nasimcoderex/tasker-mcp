import { exec } from "child_process";

export class WpCliTool {
  constructor(workingDir = "/Users/macbookair/Desktop/app") {
    this.workingDir = workingDir;
  }

  async run({ command }) {
    return new Promise((resolve, reject) => {
      exec(`wp ${command}`, { cwd: this.workingDir }, (err, stdout, stderr) => {
        if (err) {
          resolve({
            content: [
              {
                type: "text",
                text: `❌ WP-CLI Error: ${stderr || err.message}`
              }
            ],
            isError: true
          });
        } else {
          resolve({
            content: [
              {
                type: "text", 
                text: `✅ WP-CLI Result:\n${stdout}`
              }
            ]
          });
        }
      });
    });
  }
}
