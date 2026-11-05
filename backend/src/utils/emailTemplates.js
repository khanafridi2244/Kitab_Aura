import { escapeHtml as e } from "./sendEmail.js";

const clientUrl = () => (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

// Subjects must stay on one line
const oneLine = (s = "") => String(s).replace(/[\r\n]+/g, " ").trim();

const layout = (heading, body) => `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #d5deda;border-radius:8px;overflow:hidden">
  <div style="background:#0f5c4d;color:#ffffff;padding:16px 20px;font-size:20px;font-weight:bold">Kitab<span style="color:#d9a441">Aura</span></div>
  <div style="padding:20px;color:#1f2933;line-height:1.5">
    <h2 style="margin:0 0 12px;color:#0f5c4d;font-size:18px">${e(heading)}</h2>
    ${body}
  </div>
  <div style="background:#eef5f2;color:#6b7780;padding:12px 20px;font-size:12px">You received this email because of activity on your KitabAura account.</div>
</div>`;

const button = (href, label) =>
  `<p style="margin:20px 0"><a href="${e(href)}" style="background:#0f5c4d;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">${e(label)}</a></p>`;

const firstName = (name) => oneLine(name).split(" ")[0] || "there";

// Email to the person who uploaded a book, after an admin approves or rejects it
export const bookStatusEmail = ({ name, title, status, note, bookId }) => {
  const first = firstName(name);
  const clean = oneLine(title);

  if (status === "approved") {
    const url = `${clientUrl()}/books/${bookId}`;
    return {
      subject: `Your book "${clean}" is now live on KitabAura`,
      text: `Hi ${first},\n\nGood news! Your book "${clean}" was approved and is now available in the library.\n\nView it here: ${url}\n\nThank you for sharing it with other readers.\n\nKitabAura`,
      html: layout(
        "Your book is live",
        `<p>Hi ${e(first)},</p><p>Good news! Your book <strong>${e(title)}</strong> was approved and is now available in the library.</p>${button(url, "View your book")}<p>Thank you for sharing it with other readers.</p>`
      ),
    };
  }

  const url = `${clientUrl()}/my-uploads`;
  return {
    subject: `Update on your book "${clean}"`,
    text: `Hi ${first},\n\nThank you for uploading "${clean}". Unfortunately it was not approved this time.\n\nReason: ${note || "No reason was given."}\n\nYou can fix the problem and upload the book again: ${url}\n\nKitabAura`,
    html: layout(
      "Your book was not approved",
      `<p>Hi ${e(first)},</p><p>Thank you for uploading <strong>${e(title)}</strong>. Unfortunately it was not approved this time.</p><p style="background:#fdecea;padding:10px 12px;border-radius:6px"><strong>Reason:</strong> ${e(note || "No reason was given.")}</p><p>You can fix the problem and upload the book again.</p>${button(url, "Go to my uploads")}`
    ),
  };
};

// Email to the person who asked for a book, after an admin answers the request
export const requestStatusEmail = ({ name, title, status, note }) => {
  const first = firstName(name);
  const clean = oneLine(title);

  if (status === "fulfilled") {
    const url = `${clientUrl()}/browse?q=${encodeURIComponent(clean)}`;
    return {
      subject: `Good news about your book request: "${clean}"`,
      text: `Hi ${first},\n\nYour request for "${clean}" was fulfilled.${note ? `\n\nNote from the team: ${note}` : ""}\n\nFind it here: ${url}\n\nKitabAura`,
      html: layout(
        "Your request was fulfilled",
        `<p>Hi ${e(first)},</p><p>Your request for <strong>${e(title)}</strong> was fulfilled.</p>${note ? `<p style="background:#eef5f2;padding:10px 12px;border-radius:6px"><strong>Note from the team:</strong> ${e(note)}</p>` : ""}${button(url, "Find it in the library")}`
      ),
    };
  }

  if (status === "seeking_copy") {
    const requestsUrl = `${clientUrl()}/requests`;
    const uploadUrl = `${clientUrl()}/upload?title=${encodeURIComponent(clean)}`;
    return {
      subject: `Action Needed: Seeking a copy of "${clean}" - Do you have it?`,
      text: `Hi ${first},\n\nRegarding your request for "${clean}": We checked our archives and unfortunately we do not currently have a copy of this book.\n\nDo you have this book available and want to share it?\n- If YES: Please accept the request and upload the PDF here: ${uploadUrl}\n- If NO: Please visit your requests page to reject the request: ${requestsUrl}\n\n${note ? `Note from the admin: ${note}\n\n` : ""}KitabAura Team`,
      html: layout(
        "Can you share a copy of this book?",
        `<p>Hi ${e(first)},</p><p>Thank you for requesting <strong>${e(title)}</strong>. We checked our library archives and unfortunately we do not currently have this book.</p><p><strong>Do you have this book available?</strong></p><ul><li><strong>If you have it:</strong> Accept and upload the PDF to share it with fellow readers.</li><li><strong>If not available:</strong> Go to your requests and reject the request so our team knows.</li></ul>${note ? `<p style="background:#fef3c7;padding:10px 12px;border-radius:6px;color:#92400e"><strong>Note from admin:</strong> ${e(note)}</p>` : ""}${button(uploadUrl, "Accept & Upload Book")}<p style="font-size:13px;color:#5d6a63">If you do not have this book, <a href="${e(requestsUrl)}" style="color:#0f4c3a;text-decoration:underline">click here to reject the request</a> on your requests page.</p>`
      ),
    };
  }

  const url = `${clientUrl()}/requests`;
  return {
    subject: `About your book request: "${clean}"`,
    text: `Hi ${first},\n\nWe could not add "${clean}" to the library right now.\n\nReason: ${note || "No reason was given."}\n\nYou can send another request any time: ${url}\n\nKitabAura`,
    html: layout(
      "We could not add this book",
      `<p>Hi ${e(first)},</p><p>We could not add <strong>${e(title)}</strong> to the library right now.</p><p style="background:#fdecea;padding:10px 12px;border-radius:6px"><strong>Reason:</strong> ${e(note || "No reason was given.")}</p>${button(url, "Send another request")}`
    ),
  };
};