# 📊 CSV Ingest + Grid MVP

A modern, responsive web application for uploading, managing, and exporting CSV data with real-time search and inline editing capabilities.

## ✨ Features

- **📤 CSV Upload** - Drag & drop CSV file upload with validation
- **🔍 Real-time Search** - Debounced search across all data fields
- **✏️ Inline Editing** - Edit data directly in the grid
- **📄 Pagination** - Efficient data loading with pagination
- **📥 Export** - Download data as CSV
- **🔔 Toast Notifications** - Beautiful success/error notifications
- **📱 Responsive Design** - Works on desktop and mobile
- **⚡ Performance** - Optimized with React Query caching

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack React Query
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Backend API running on `http://localhost:5008`

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables** (optional)

   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:5008" > .env
   ```

4. **Start development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── CSVUpload.tsx   # File upload component
│   ├── DataGrid.tsx    # Data table with editing
│   └── Header.tsx      # App header with search
├── hooks/              # Custom React hooks
│   ├── useCSVData.ts   # React Query hooks
│   └── useDebounce.ts  # Search debouncing
├── providers/          # Context providers
│   └── QueryProvider.tsx
├── services/           # API services
│   └── api.ts         # Axios configuration
├── App.tsx            # Main application
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript checks
```

## 📊 API Endpoints

The application expects the following backend endpoints:

| Method   | Endpoint            | Description                                 |
| -------- | ------------------- | ------------------------------------------- |
| `GET`    | `/api/csv/data`     | Get paginated data with search              |
| `POST`   | `/api/csv/upload`   | Upload CSV file                             |
| `PUT`    | `/api/csv/data/:id` | Update specific row                         |
| `DELETE` | `/api/csv/data/:id` | Delete specific row                         |
| `DELETE` | `/api/csv/data`     | Delete multiple rows (payload: `{ids: []}`) |
| `GET`    | `/api/csv/export`   | Export data as CSV                          |
| `GET`    | `/api/csv/error`    | Download error file                         |

### Query Parameters

**GET /api/csv/data**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 100)
- `search` - Search term

## 🎯 Usage

### Uploading CSV Files

1. Click "Choose File" or drag & drop a CSV file
2. Required fields: `PartMark`, `AssemblyMark`, `Material`, `Thickness`
3. Upload results are displayed in the upload card showing:
   - Valid rows count
   - Invalid rows count
   - Download button for error file (if any invalid rows)
4. Invalid rows are exported to `error.csv` with validation reasons

### Searching Data

1. Type in the search box
2. Search works across: Part Mark, Assembly Mark, Material
3. Results automatically reset to page 1
4. 300ms debounce prevents excessive API calls

### Editing Data

1. Click "Edit" button on any row
2. Modify fields inline
3. Click "Save" to update or "Cancel" to discard
4. Changes are saved to the backend immediately

### Deleting Data

**Single Row Deletion:**

1. Click "Delete" button on any row
2. Confirm deletion in the popup dialog
3. Row is permanently removed from the database

**Bulk Deletion:**

1. Check the boxes next to rows you want to delete
2. Use "Select All" checkbox to select all visible rows
3. Click "Delete Selected" button in the header
4. Confirm deletion in the popup dialog
5. Selected rows are permanently removed

### Exporting Data

1. Click "Export CSV" button
2. File downloads automatically with current date
3. Includes all data (respects current search filter)

## 🔧 Configuration

### Environment Variables

| Variable       | Default                 | Description     |
| -------------- | ----------------------- | --------------- |
| `VITE_API_URL` | `http://localhost:5008` | Backend API URL |

### Customization

- **Search debounce delay**: Modify `useDebounce` hook (default: 300ms)
- **Page size**: Change limit in `useCSVData` hook (default: 100)
- **API timeout**: Adjust in `api.ts` (default: 10s)

## 🎨 Styling

The project uses Tailwind CSS for styling. Key design tokens:

- **Primary**: Blue (`blue-600`, `blue-700`)
- **Success**: Green (`green-600`, `green-700`)
- **Error**: Red (`red-600`, `red-700`)
- **Background**: Gray (`gray-50`, `gray-100`)

## 🚀 Performance Features

- **React Query caching** - Reduces API calls
- **Debounced search** - Prevents excessive requests
- **Pagination** - Loads only 100 rows at a time
- **Optimistic updates** - Instant UI feedback
- **Code splitting** - Smaller bundle sizes

## 🐛 Troubleshooting

### Common Issues

**Build fails with TypeScript errors**

```bash
pnpm add -D @types/node
```

**API calls failing**

- Check if backend is running on `http://localhost:5008`
- Verify CORS settings on backend
- Check browser network tab for errors

**Search not working**

- Ensure debounce delay isn't too high
- Check if search term is being passed correctly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vite](https://vitejs.dev/) - Build tool
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

---

**Built with ❤️ using modern React patterns**
