'use client'

import { useState } from 'react'
import HtmlEditor from '@/components/ui/html-editor'

export default function TestEditorPage() {
  const [content, setContent] = useState('<p>Bonjour TinyMCE 👋</p>')
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Test TinyMCE Editor</h1>
      <p className="text-sm text-gray-600">Cette page sert uniquement à vérifier le chargement de TinyMCE (clé API, plugins, UI).</p>
      <div className="bg-white border rounded-lg">
        <HtmlEditor
          value={content}
          onChange={setContent}
          variableType="page"
          height={400}
        />
      </div>
      <div className="bg-gray-50 border rounded p-4">
        <h2 className="text-sm font-medium mb-2">Contenu actuel</h2>
        <pre className="text-xs overflow-auto whitespace-pre-wrap">{content}</pre>
      </div>
    </div>
  )
}