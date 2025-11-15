// Configuration TinyMCE pour l'application

// Fonction pour obtenir l'URL du script TinyMCE avec la clé API
export const getTinyMCEScriptSrc = async (): Promise<string> => {
  try {
    const response = await fetch('/api/tinymce-config')
    if (response.ok) {
      const data = await response.json()
      return data.scriptSrc || 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js'
    }
  } catch (error) {
    console.warn('Impossible de récupérer la configuration TinyMCE, utilisation de la version gratuite')
  }
  
  // Fallback vers la version gratuite
  return 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js'
}

export const TINYMCE_CONFIG = {
  // Utilisation du CDN TinyMCE pour éviter les problèmes de bundling
  tinymceScriptSrc: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js',
  
  // Configuration de base pour tous les éditeurs
  baseConfig: {
    branding: false,
    promotion: false,
    license_key: 'gpl',
    menubar: false,
    statusbar: false,
    resize: false,
    
    // Plugins essentiels + premium
    plugins: [
      // Core editing features
      'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
      // Premium features (si clé API disponible)
      'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'advtemplate', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf',
      // Autres plugins utiles
      'preview', 'fullscreen', 'insertdatetime', 'help', 'template', 'nonbreaking', 'pagebreak', 'save'
    ],
    
    // Barre d'outils complète avec fonctionnalités premium
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
      'link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | ' +
      'align lineheight | checklist numlist bullist indent outdent | emoticons charmap | ' +
      'forecolor backcolor | casechange formatpainter | removeformat | code codesample | fullscreen help',
    
    // Styles de contenu
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
        font-size: 14px;
        line-height: 1.6;
        color: #333;
        max-width: none;
        margin: 0;
        padding: 20px;
      }
      .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
        color: #999;
        font-style: italic;
      }
      h1, h2, h3, h4, h5, h6 {
        margin-top: 1em;
        margin-bottom: 0.5em;
        font-weight: 600;
      }
      p {
        margin-bottom: 1em;
      }
      a {
        color: #3b82f6;
        text-decoration: underline;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
      }
      table td, table th {
        border: 1px solid #ddd;
        padding: 8px;
      }
      table th {
        background-color: #f8f9fa;
        font-weight: 600;
      }
      blockquote {
        border-left: 4px solid #e5e7eb;
        margin: 1em 0;
        padding-left: 1em;
        color: #6b7280;
        font-style: italic;
      }
      code {
        background-color: #f1f5f9;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.9em;
      }
      pre {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 1em;
        overflow-x: auto;
      }
    `,
    
    // Configuration des images
    image_advtab: true,
    image_caption: true,
    image_title: true,
    automatic_uploads: true,
    file_picker_types: 'image',
    images_upload_handler: (blobInfo: any) => {
      return new Promise((resolve, reject) => {
        // Pour l'instant, on rejette l'upload d'images
        // TODO: Implémenter l'upload d'images vers un service de stockage
        reject('Upload d\'images non configuré')
      })
    },

    // Configuration des commentaires TinyMCE
    tinycomments_mode: 'embedded',
    tinycomments_author: 'Utilisateur',

    // Configuration des merge tags pour les templates d'email
    mergetags_list: [
      { value: 'SITE_NAME', title: 'Nom du site' },
      { value: 'USER_NAME', title: 'Nom utilisateur' },
      { value: 'USER_EMAIL', title: 'Email utilisateur' },
      { value: 'SITE_URL', title: 'URL du site' },
      { value: 'ORDER_NUMBER', title: 'Numéro de commande' },
      { value: 'COURSE_NAME', title: 'Nom du cours' },
      { value: 'RESET_URL', title: 'URL de réinitialisation' },
      { value: 'VERIFICATION_URL', title: 'URL de vérification' },
    ],

    // Configuration AI (désactivée pour l'instant)
    ai_request: (request: any, respondWith: any) => 
      respondWith.string(() => Promise.reject('Assistant IA non configuré')),
    
    // Configuration des tableaux
    table_default_attributes: {
      border: '1'
    },
    table_default_styles: {
      'border-collapse': 'collapse',
      'width': '100%'
    },
    table_responsive_width: true,
    
    // Templates prédéfinis
    templates: [
      {
        title: 'Email Simple',
        description: 'Template basique pour email',
        content: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff;">
            <div style="text-align: center; padding: 20px; border-bottom: 2px solid #e9ecef;">
              <img src="{{LOGO_URL}}" alt="{{SITE_NAME}}" style="max-width: 200px; height: auto;">
            </div>
            <div style="padding: 40px 20px;">
              <h1 style="color: #333; margin-bottom: 20px;">Bonjour {{userName}} !</h1>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Votre contenu ici...
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{actionUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  {{actionText}}
                </a>
              </div>
            </div>
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #e9ecef;">
              <p>© {{CURRENT_YEAR}} {{SITE_NAME}}. Tous droits réservés.</p>
            </div>
          </div>
        `
      },
      {
        title: 'Section Hero',
        description: 'Section hero pour page',
        content: `
          <section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 80px 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
            <div style="max-width: 800px; margin: 0 auto;">
              <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Titre Principal</h1>
              <p style="font-size: 1.25rem; margin-bottom: 30px; opacity: 0.9;">Description de votre service ou produit</p>
              <a href="#" style="background: white; color: #667eea; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Commencer</a>
            </div>
          </section>
        `
      },
      {
        title: 'Section Services',
        description: 'Grille de services',
        content: `
          <section style="padding: 60px 20px; background-color: #f8f9fa;">
            <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
              <h2 style="font-size: 2.5rem; margin-bottom: 20px; color: #333;">Nos Services</h2>
              <p style="font-size: 1.1rem; color: #666; margin-bottom: 50px;">Découvrez notre gamme complète de services</p>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
                <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <h3 style="color: #333; margin-bottom: 15px;">Service 1</h3>
                  <p style="color: #666; line-height: 1.6;">Description du service...</p>
                </div>
                <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <h3 style="color: #333; margin-bottom: 15px;">Service 2</h3>
                  <p style="color: #666; line-height: 1.6;">Description du service...</p>
                </div>
                <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <h3 style="color: #333; margin-bottom: 15px;">Service 3</h3>
                  <p style="color: #666; line-height: 1.6;">Description du service...</p>
                </div>
              </div>
            </div>
          </section>
        `
      }
    ],
    
    // Configuration avancée
    paste_data_images: true,
    paste_as_text: false,
    paste_webkit_styles: 'none',
    paste_remove_styles_if_webkit: false,
    
    // Validation du contenu
    verify_html: false,
    cleanup: true,
    convert_urls: false,
    
    // Configuration de l'interface
    skin: 'oxide',
    content_css: 'default',
    
    // Raccourcis clavier personnalisés
    setup: (editor: any) => {
      // Raccourci pour insérer un lien
      editor.addShortcut('ctrl+k', 'Insert Link', () => {
        editor.execCommand('mceLink')
      })
      
      // Raccourci pour insérer une image
      editor.addShortcut('ctrl+shift+i', 'Insert Image', () => {
        editor.execCommand('mceImage')
      })
      
      // Raccourci pour insérer un tableau
      editor.addShortcut('ctrl+shift+t', 'Insert Table', () => {
        editor.execCommand('mceInsertTable')
      })
    }
  }
}

// Configuration spécifique pour les emails
export const EMAIL_EDITOR_CONFIG = {
  ...TINYMCE_CONFIG.baseConfig,
  toolbar: 'undo redo | blocks fontsize | bold italic underline | ' +
    'forecolor backcolor | alignleft aligncenter alignright | ' +
    'bullist numlist | link image | template | code',
  
  // Styles spécifiques aux emails
  content_style: TINYMCE_CONFIG.baseConfig.content_style + `
    body {
      background-color: #f5f5f5;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  `
}

// Configuration spécifique pour les pages
export const PAGE_EDITOR_CONFIG = {
  ...TINYMCE_CONFIG.baseConfig,
  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
    'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | removeformat | ' +
    'link image media table | template | code codesample | fullscreen',
  
  // Plus de templates pour les pages
  templates: [
    ...TINYMCE_CONFIG.baseConfig.templates,
    {
      title: 'Call to Action',
      description: 'Section d\'appel à l\'action',
      content: `
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 60px 20px; text-align: center; border-radius: 12px; margin: 40px 0;">
          <h2 style="font-size: 2.5rem; margin-bottom: 20px;">Prêt à commencer ?</h2>
          <p style="font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9;">Rejoignez des milliers de clients satisfaits</p>
          <a href="#contact" style="background: white; color: #3b82f6; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Nous contacter</a>
        </div>
      `
    }
  ]
}