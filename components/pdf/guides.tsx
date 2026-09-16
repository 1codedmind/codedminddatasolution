import type { ToolGuideProps } from "@/components/pdf/ToolGuide";

/**
 * Content for each PDF tool.
 *
 * Every limit quoted here is the one enforced in that tool's own source, and
 * every behavioural note describes something the implementation actually does.
 * If a tool changes, this has to change with it — a guide that drifts out of
 * date is worse than none.
 */

const BROWSER_NOTE =
  "Your file is opened by JavaScript running on your own machine and the result is written back to a download. Nothing is sent to a server, so there is no upload wait, no queue, and no copy of your document sitting in someone else's storage.";

export const GUIDES: Record<string, ToolGuideProps> = {
  merge: {
    name: "Merge PDF",
    intro: (
      <>
        <p>
          Combining PDFs is the most common reason people go looking for a PDF
          tool, usually because something has to be submitted as a single file —
          a scanned form plus its attachments, several invoices for one expense
          claim, or chapters that were written separately.
        </p>
        <p>
          This merger works at page level rather than file level. Every page from
          every file you add appears as a thumbnail, and you drag them into the
          order you want before merging. That matters when the pages you need are
          interleaved: a two-sided scan often produces all the fronts in one file
          and all the backs in another, and merging them end to end gives you the
          wrong document.
        </p>
        <p>{BROWSER_NOTE}</p>
      </>
    ),
    steps: [
      "Drop your PDFs onto the drop zone, or click to browse. Add as many as you need in one go or a few at a time.",
      "Wait for the page thumbnails to render — larger documents take a moment, and the counter tells you how many are ready.",
      "Drag any page to move it. The order shown is exactly the order you will get.",
      "Merge, then download. The result is a single PDF containing the pages in that order.",
    ],
    limits: [
      { label: "Files at once", value: "Up to 20" },
      { label: "Size per file", value: "50 MB" },
      { label: "Accepted", value: "PDF only" },
      { label: "Pages", value: "No fixed limit" },
    ],
    notes: [
      "Merging copies pages as they are. Text stays selectable, links inside a page keep working, and image quality is untouched — nothing is re-encoded or flattened.",
      "A merged file is roughly the sum of its inputs. PDFs already store their images compressed, so combining four 2 MB files gives you about 8 MB, not something smaller.",
      "Bookmarks and form fields belonging to the original documents are not carried across. If the source PDFs have fillable forms you need to keep, merge them in a tool that preserves AcroForm data instead.",
      "Password-protected PDFs cannot be opened. Remove the password in your PDF reader first, then merge.",
    ],
    faqs: [
      {
        q: "Are my files uploaded anywhere?",
        a: "No. The merge runs entirely in your browser using the pdf-lib library. The file never leaves your device, which is why it works with no account and why the speed depends on your own machine rather than our servers.",
      },
      {
        q: "Can I reorder pages before merging?",
        a: "Yes, and that is the main reason to use this rather than a simple concatenator. Every page from every file appears as a draggable thumbnail, so you can interleave two one-sided scans or move a signature page to the end.",
      },
      {
        q: "Does merging reduce quality?",
        a: "No. Pages are copied across without re-encoding, so text stays selectable and images keep their original resolution. The output is not compressed either, so expect the merged file to be about the size of its parts added together.",
      },
      {
        q: "Why will my file not open?",
        a: "The two usual causes are password protection and corruption. An encrypted PDF cannot be read without its password — remove it in your PDF reader and try again. A file that fails to open in other readers too is damaged at source.",
      },
      {
        q: "Is there a limit on how many files I can merge?",
        a: "Twenty files per merge, each up to 50 MB. There is no page limit, but very large documents take longer to render thumbnails because that work happens on your own machine.",
      },
    ],
  },

  split: {
    name: "Split PDF",
    intro: (
      <>
        <p>
          Splitting is for pulling a part out of a whole: one contract from a
          bundle of scans, the pages of a report that actually concern you, or a
          single certificate from a batch someone sent as one file.
        </p>
        <p>
          You pick the pages you want and get a new PDF containing only those,
          with the original left untouched on your machine. Because the work
          happens locally, documents containing anything sensitive — medical
          records, contracts, identity documents — never leave your control.
        </p>
        <p>{BROWSER_NOTE}</p>
      </>
    ),
    steps: [
      "Drop a single PDF onto the drop zone.",
      "Choose the pages you want to keep. Ranges and individual pages both work.",
      "Split, then download the result.",
    ],
    limits: [
      { label: "Files at once", value: "One" },
      { label: "Size", value: "Up to 100 MB" },
      { label: "Accepted", value: "PDF only" },
      { label: "Output", value: "A new PDF, original untouched" },
    ],
    notes: [
      "Page numbers here are positions in the file, counting from one. They will not match printed page numbers in a document whose numbering starts after a cover or contents page.",
      "The extracted pages keep their original size and orientation. A document mixing portrait and landscape pages keeps that mix.",
      "Splitting does not shrink a file proportionally. PDFs share resources such as embedded fonts between pages, so a copy of those may travel with whatever you extract.",
      "Encrypted PDFs cannot be opened. Remove the password first.",
    ],
    faqs: [
      {
        q: "Does splitting change the original file?",
        a: "No. The original stays exactly as it is on your device. The split produces a new PDF containing the pages you chose, which you then download.",
      },
      {
        q: "Can I extract non-consecutive pages?",
        a: "Yes. You can select individual pages as well as ranges, so pulling pages 1, 4 and 9 into a single new document works.",
      },
      {
        q: "Why is my extracted file not much smaller?",
        a: "A PDF stores fonts and other resources once and references them from every page that needs them. Extracting a few pages can carry a copy of those shared resources with it, so the saving is often less than the page ratio suggests.",
      },
      {
        q: "Is the file uploaded to a server?",
        a: "No. Everything runs in your browser, which is what makes it safe to use for confidential documents. No copy exists anywhere but your own machine.",
      },
    ],
  },

  rotate: {
    name: "Rotate PDF",
    intro: (
      <>
        <p>
          Scanners and phone cameras routinely produce PDFs where some pages are
          sideways or upside down. Your reader will let you spin the view, but
          that is a temporary setting — send the file on and the recipient sees
          it the wrong way round again.
        </p>
        <p>
          Rotating here writes the orientation into the document itself, so it
          opens correctly everywhere: in another reader, on a phone, and when
          printed.
        </p>
        <p>{BROWSER_NOTE}</p>
      </>
    ),
    steps: [
      "Drop a PDF onto the drop zone.",
      "Rotate the pages that need it, in 90-degree steps.",
      "Apply the rotation and download the corrected file.",
    ],
    limits: [
      { label: "Files at once", value: "One" },
      { label: "Size", value: "Up to 100 MB" },
      { label: "Steps", value: "90° increments" },
      { label: "Accepted", value: "PDF only" },
    ],
    notes: [
      "Rotation is stored as a property of the page rather than by redrawing it, so nothing is re-rendered and no quality is lost however many times you rotate.",
      "Because the change is written into the file, it survives being emailed, printed, and opened in a different reader. Rotating the view in a PDF reader does not.",
      "A page can already carry a rotation set by the scanner. The tool rotates relative to how the page currently displays, which is what you see on screen.",
      "Encrypted PDFs cannot be opened. Remove the password first.",
    ],
    faqs: [
      {
        q: "Will rotating reduce quality?",
        a: "No. Rotation is recorded as an instruction on the page rather than by redrawing its contents, so the image data is untouched no matter how many times you rotate.",
      },
      {
        q: "Why does my PDF look right here but wrong when I send it?",
        a: "Almost certainly because the rotation was applied in your reader's view rather than saved into the file. Rotating with this tool writes the orientation into the document, so it travels with it.",
      },
      {
        q: "Can I rotate only some pages?",
        a: "Yes. Rotation is applied per page, which is what you need for a scan where only a few sheets went through sideways.",
      },
      {
        q: "Is my file uploaded?",
        a: "No. The rotation is applied in your browser and the corrected file is written straight to a download.",
      },
    ],
  },

  sign: {
    name: "Sign PDF",
    intro: (
      <>
        <p>
          Most documents that ask for a signature only need a visible mark — a
          delivery note, an internal form, a rental agreement between
          individuals. Printing, signing, and scanning back is the slow way to
          produce one.
        </p>
        <p>
          This places a signature image onto the page and writes it into the PDF.
          You position it where it belongs, and the result is a document you can
          send on.
        </p>
        <p>
          Be clear about what this is: a <strong>visible signature</strong>, not
          a cryptographic digital signature. It does not embed a certificate and
          cannot prove who applied it or detect later tampering. For anything
          needing legal non-repudiation — and in some jurisdictions and
          industries that is a hard requirement — use a qualified e-signature
          service instead.
        </p>
      </>
    ),
    steps: [
      "Drop the PDF you need to sign.",
      "Add your signature as an image — PNG, JPEG or WebP.",
      "Position it on the page where the signature belongs.",
      "Apply and download the signed document.",
    ],
    limits: [
      { label: "Signature image", value: "PNG, JPEG or WebP" },
      { label: "Images at once", value: "One" },
      { label: "Document", value: "PDF only" },
      { label: "Type", value: "Visible mark, not a certificate" },
    ],
    notes: [
      "A PNG with a transparent background gives the cleanest result, because the page shows through around the strokes instead of sitting behind a white rectangle.",
      "Photographing a signature on white paper works, but crop it tightly and expect a visible box unless you remove the background first.",
      "This does not apply a cryptographic digital signature. There is no certificate, so nothing proves who signed or whether the document changed afterwards.",
      "Everything runs in your browser, so the contract you are signing is never uploaded — which matters more for this tool than for most.",
    ],
    faqs: [
      {
        q: "Is this a legally binding signature?",
        a: "It produces a visible signature image on the page, which many everyday agreements accept. It is not a qualified or cryptographic digital signature: no certificate is embedded, so it cannot prove identity or detect later changes. Where the law or the counterparty requires a qualified e-signature, use a dedicated service.",
      },
      {
        q: "What image format works best?",
        a: "A PNG with a transparent background, because the page shows through around the strokes. JPEG and WebP work but have no transparency, so the signature sits inside a visible rectangle.",
      },
      {
        q: "Can I sign more than one page?",
        a: "The signature is placed where you position it. For a document needing a mark on several pages, apply it to each in turn.",
      },
      {
        q: "Is my contract uploaded to a server?",
        a: "No, and that matters here more than anywhere else on the site. The document and your signature image are both processed in your own browser, so neither is transmitted or stored by us.",
      },
    ],
  },

  "jpg-to-pdf": {
    name: "JPG to PDF",
    intro: (
      <>
        <p>
          Photographs are a poor way to submit paperwork. Phone cameras produce
          one file per shot, often in HEIC or WebP, and a recipient who asked for
          &ldquo;a copy of the receipts&rdquo; ends up with nine attachments in three
          formats.
        </p>
        <p>
          Converting to PDF solves both problems at once: many images become one
          document, in a format that opens the same way everywhere and prints
          predictably.
        </p>
        <p>{BROWSER_NOTE}</p>
      </>
    ),
    steps: [
      "Drop your images, or click to browse. JPEG, PNG and WebP are accepted.",
      "Put them in the order you want — that is the page order of the finished PDF.",
      "Convert, then download the single document.",
    ],
    limits: [
      { label: "Images at once", value: "Up to 30" },
      { label: "Size per image", value: "20 MB" },
      { label: "Accepted", value: "JPEG, PNG, WebP" },
      { label: "Output", value: "One PDF, one image per page" },
    ],
    notes: [
      "Each image becomes one page. Thirty photographs produce a thirty-page document.",
      "Images are embedded at their existing resolution, so a PDF of phone photographs is large. That is the honest trade: the pages stay as sharp as the originals.",
      "A PDF of photographs contains pictures of text, not text. It cannot be searched or copied from, and screen readers cannot read it. If the recipient needs to search the content, it has to be scanned with OCR instead.",
      "HEIC, the default on newer iPhones, is not accepted by browsers. Set the camera to Most Compatible, or export as JPEG first.",
    ],
    faqs: [
      {
        q: "Can I control the page order?",
        a: "Yes. Arrange the images before converting and the PDF follows that order exactly, one image per page.",
      },
      {
        q: "Why is the PDF so large?",
        a: "Because the images are embedded at full resolution rather than being downsampled. A modern phone photograph is several megabytes, and ten of them make a PDF of roughly that combined size. Resize the images first if you need a smaller file.",
      },
      {
        q: "Can I search the text in the resulting PDF?",
        a: "No. The pages contain photographs of text, not text itself, so nothing is searchable or selectable. Producing searchable text from an image requires OCR, which this tool does not perform.",
      },
      {
        q: "Why will my iPhone photos not upload?",
        a: "They are probably HEIC, which browsers cannot decode. In Settings → Camera → Formats choose Most Compatible to shoot JPEG, or export the photos as JPEG before converting.",
      },
      {
        q: "Are my images uploaded?",
        a: "No. The conversion happens in your browser, so the photographs stay on your device.",
      },
    ],
  },
};
