'use client'

import { useState } from 'react'
import { RichHtmlEditor } from '@/components/ui/rich-html-editor'

export default function TestEditorPage() {
  const [content, setContent] = useState('<p>Bonjour Éditeur maison 👋</p>')
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Test Éditeur HTML Maison</h1>
      <p className="text-sm text-gray-600">Cette page sert à vérifier le chargement et les fonctionnalités de l'éditeur HTML maison.</p>
      <div className="bg-white border rounded-lg">
        <RichHtmlEditor
          value={content}
          onChange={setContent}
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
