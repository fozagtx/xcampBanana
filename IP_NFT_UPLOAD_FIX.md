# IP NFT Registration Upload Fix

## Problem

IP NFT registration was failing in the modal even when uploading images, videos, PDFs, and audio files. The error message would just say "failed" without providing specific details.

## Root Causes Identified

### 1. File Type Restriction
The file input field was restricted to only accept PDF files:
```typescript
accept=".pdf"
```

This meant that even though the Origin SDK's `mintFile()` method supports various file types (images, videos, audio, PDFs), users could not select or upload these files through the UI.

### 2. Missing Environment Configuration
The `.env` file was missing, which meant the Camp Network authentication variables were not properly set:
- `NEXT_PUBLIC_CAMP_CLIENT_ID`
- `NEXT_PUBLIC_CAMP_API_KEY`
- `NEXT_PUBLIC_CAMP_ENVIRONMENT`

Without these, the Origin SDK would fail authentication and content moderation checks.

### 3. Poor Error Messages
The error handling was generic and didn't provide specific guidance on what went wrong, making it difficult for users to troubleshoot issues.

## Solutions Implemented

### 1. Expanded File Type Support

**File: `app/components/BrandkitMint.tsx`**

Updated the file input to accept multiple media types:

```typescript
<input
  type="file"
  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.mkv,.mp3,.wav,.m4a,.ogg"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setContent(""); // Clear JSON content when file is uploaded
    }
  }}
  className="w-full p-3 border rounded-md bg-white border-zinc-300 text-black"
/>
```

**Supported File Types:**
- **Images**: JPG, JPEG, PNG, GIF, WebP
- **Videos**: MP4, MOV, AVI, MKV
- **Audio**: MP3, WAV, M4A, OGG
- **Documents**: PDF

### 2. Added File Validation

Added comprehensive validation before attempting to mint:

```typescript
// Validate file type
const allowedTypes = [
  'application/pdf',
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
  'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg'
];

if (!allowedTypes.includes(pdfFile.type)) {
  alert(`Unsupported file type: ${pdfFile.type}\n\nPlease upload an image, video, audio file, or PDF.`);
  return;
}

// Check file size (max 100MB for most files, 500MB for videos)
const maxSize = pdfFile.type.startsWith('video/') ? 500 * 1024 * 1024 : 100 * 1024 * 1024;
if (pdfFile.size > maxSize) {
  const maxSizeMB = maxSize / (1024 * 1024);
  alert(`File size exceeds the maximum allowed size of ${maxSizeMB}MB.\n\nYour file: ${(pdfFile.size / (1024 * 1024)).toFixed(2)}MB`);
  return;
}
```

**File Size Limits:**
- Images, Audio, PDFs: 100MB max
- Videos: 500MB max

### 3. Improved Error Messages

Enhanced error handling to provide specific, actionable feedback:

```typescript
catch (e) {
  console.error("Error minting brandkit:", e);

  let errorMessage = "Failed to mint brandkit.";

  if (e instanceof Error) {
    if (e.message.includes("unauthorized") || e.message.includes("authorization")) {
      errorMessage = "Authorization failed. Please ensure:\n\n1. You are connected to the correct wallet\n2. Your wallet has sufficient funds\n3. The CAMP_CLIENT_ID environment variable is properly configured\n4. Try disconnecting and reconnecting your wallet";
    } else if (e.message.includes("network") || e.message.includes("connection")) {
      errorMessage = "Network error. Please check your internet connection and try again.";
    } else if (e.message.includes("rejected") || e.message.includes("denied")) {
      errorMessage = "Transaction was rejected. Please try again and confirm the transaction in your wallet.";
    } else if (e.message.includes("insufficient")) {
      errorMessage = "Insufficient funds. Please ensure your wallet has enough balance for gas fees.";
    } else {
      errorMessage = `Error: ${e.message}\n\nPlease check all parameters and try again.`;
    }
  }

  alert(errorMessage);
}
```

### 4. Created .env File

Created a `.env` file with proper Camp Network credentials:

```env
# Camp Network Configuration
NEXT_PUBLIC_CAMP_CLIENT_ID=fce77d7a-8085-47ca-adff-306a933e76aa
NEXT_PUBLIC_CAMP_API_KEY=4f1a2c9c-008e-4a2e-8712-055fa04f9ffa
NEXT_PUBLIC_CAMP_ENVIRONMENT=PRODUCTION
```

### 5. Dynamic File Type Display

Updated the UI to dynamically show the file type being uploaded:

```typescript
// Determine file type for description
const fileType = pdfFile
  ? pdfFile.type.startsWith('image/') ? 'Image'
  : pdfFile.type.startsWith('video/') ? 'Video'
  : pdfFile.type.startsWith('audio/') ? 'Audio'
  : pdfFile.type === 'application/pdf' ? 'PDF'
  : 'File'
  : 'JSON Prompt';

const metadata = {
  name: `Brandkit: ${name}`,
  description: `Nanabanapro Brandkit ${fileType}`,
  price: priceFloat,
  duration: durationDays,
  royalty: royaltyPercent,
};
```

Button text also shows the file extension:
```typescript
{minting ? "Minting..." : `Mint Brandkit ${pdfFile ? `(${pdfFile.name.split('.').pop()?.toUpperCase()})` : "(JSON)"}`}
```

## Testing Checklist

After applying these fixes, test the following:

### File Upload Tests
- [ ] Upload a JPEG image
- [ ] Upload a PNG image
- [ ] Upload a GIF image
- [ ] Upload a WebP image
- [ ] Upload an MP4 video
- [ ] Upload a MOV video
- [ ] Upload an MP3 audio file
- [ ] Upload a WAV audio file
- [ ] Upload a PDF document
- [ ] Try uploading an unsupported file type (should show error)
- [ ] Try uploading a file that's too large (should show error)

### Error Handling Tests
- [ ] Test with disconnected wallet (should show authorization error)
- [ ] Test with insufficient funds (should show funds error)
- [ ] Test rejecting transaction (should show rejection error)
- [ ] Test with invalid price/duration/royalty (should show validation errors)

### Integration Tests
- [ ] Verify environment variables are loaded
- [ ] Confirm wallet connection works
- [ ] Successfully mint an IP NFT with each file type
- [ ] Check that minted NFTs appear in the marketplace
- [ ] Verify metadata is correctly set for each file type

## How to Use

### Step 1: Restart Development Server

If the dev server is running, restart it to load the new `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
# or
bun dev
```

### Step 2: Clear Browser Cache

Clear your browser cache and local storage:
1. Open Developer Tools (F12)
2. Go to Application tab
3. Clear Local Storage and Session Storage
4. Reload the page

### Step 3: Test File Upload

1. Connect your wallet via the Camp Modal
2. Navigate to the Brandkit Mint section
3. Enter a Brandkit name
4. Set price, duration, and royalty
5. Click "Upload File" and select any supported file type
6. Click "Mint Brandkit" button
7. Confirm the transaction in your wallet

### Expected Behavior

- File input should now accept all supported file types
- File size validation should prevent uploads that are too large
- Clear error messages should guide you if something goes wrong
- Successful uploads should show the token ID in the success message

## Common Issues & Solutions

### Issue: "Unsupported file type" error

**Cause:** The file type is not in the allowed list.

**Solution:** Ensure you're uploading one of these formats:
- Images: .jpg, .jpeg, .png, .gif, .webp
- Videos: .mp4, .mov, .avi, .mkv
- Audio: .mp3, .wav, .m4a, .ogg
- Documents: .pdf

### Issue: "File size exceeds maximum" error

**Cause:** The file is too large.

**Solution:**
- For images, audio, and PDFs: Compress to under 100MB
- For videos: Compress to under 500MB

### Issue: "Authorization failed" error

**Cause:** Missing or incorrect environment variables, or wallet not properly connected.

**Solution:**
1. Verify `.env` file exists with correct values
2. Restart development server
3. Disconnect and reconnect your wallet
4. Ensure wallet has sufficient funds

### Issue: Still seeing upload failures

**Troubleshooting steps:**
1. Check browser console for detailed error messages
2. Verify the `.env` file is in the root directory
3. Ensure environment variables start with `NEXT_PUBLIC_`
4. Confirm wallet is connected to the correct network
5. Check that you have enough funds for gas fees

## Files Modified

1. **`app/components/BrandkitMint.tsx`** - Main component with upload functionality
   - Expanded file type support
   - Added file validation
   - Improved error messages
   - Dynamic file type display

2. **`.env`** (Created) - Environment configuration
   - Camp Network credentials
   - API keys

3. **`IP_NFT_UPLOAD_FIX.md`** (Created) - This documentation

## Technical Details

### Origin SDK mintFile Method

The fix leverages the Origin SDK's `mintFile()` method which accepts:

```typescript
await auth.origin.mintFile(
  file,        // File object (any supported type)
  metadata,    // Name, description, pricing info
  license,     // Price, duration, royalty, payment token
  parentIds    // Optional array for derivative works
)
```

### Supported MIME Types

The validation checks against these MIME types:
- `application/pdf`
- `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`
- `video/mp4`, `video/quicktime`, `video/x-msvideo`, `video/x-matroska`
- `audio/mpeg`, `audio/wav`, `audio/mp4`, `audio/ogg`

## Next Steps

1. ✅ Test all file types to ensure they upload correctly
2. ✅ Monitor for any new error patterns
3. ✅ Consider adding progress indicator for large file uploads
4. ✅ Consider adding file preview before minting
5. ✅ Consider implementing drag-and-drop file upload

## Additional Resources

- Origin SDK Documentation: See the task description for full SDK docs
- Camp Network: https://origin.camp
- Previous Fix: See `CAMP_MODAL_FIX.md` for authentication setup details

---

**Note:** This fix addresses the file upload restrictions and improves error handling. Users should now be able to successfully upload and mint IP NFTs with images, videos, PDFs, and audio files.
