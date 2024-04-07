// - This is a Recipe Sheet + results

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"
import jsPDF from "jspdf"
import { Download, File, Loader2, Trash2Icon } from "lucide-react"
import toast from "react-hot-toast"

import FavoritesSheet from "./FavoritesSheet"
import PDFViewer from "./PdfViewer"
import { downloadAndEmbedImage } from "./actions"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"

const downloadFavoritesPDF = async (favorites) => {
  if (!favorites || Object.keys(favorites).length === 0) {
    toast("No favorites found", {
      icon: "🙈",
      style: {
        background: "#18181b",
      },
    })
    return
  }
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })
  let yOffset = 10
  const lineHeight = 10 // Adjust line height as needed
  const pageHeight = doc.internal.pageSize.height

  for (const [recipeName, { link, image }] of Object.entries(favorites)) {
    // Embed image if available
    if (image) {
      try {
        console.log(image)
        const imgData = await downloadAndEmbedImage(image)
        if (imgData) {
          // Add image at current yOffset
          doc.addImage(imgData, 2, yOffset, 32, 32) // Adjust width and height as needed
          // Increase yOffset for next content
          yOffset += 5 // Adjust vertical spacing between image and title
        } else {
          console.error(`Failed to embed image for ${recipeName}`)
        }
      } catch (error) {
        console.error(`Error embedding image for ${recipeName}:`, error)
      }
    }

    // Style for recipe name
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    const truncatedName = recipeName.substring(0, 40)
    const textLines = doc.splitTextToSize(truncatedName, 100)
    doc.text(textLines, 40, yOffset)

    // Calculate number of lines for link
    const linkLines = doc.splitTextToSize(link, 160)

    // Style for link
    doc.setTextColor(0, 0, 255)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    const linkYOffset = yOffset + textLines.length * lineHeight - 5 // Use same yOffset as recipe name

    const maxLinkLength = 60
    const truncatedLink =
      link.length > maxLinkLength
        ? link.substring(0, maxLinkLength) + "..."
        : link
    doc.textWithLink(truncatedLink, 40, linkYOffset + lineHeight, { url: link })

    yOffset += (textLines.length + linkLines.length + 1) * lineHeight

    if (yOffset > pageHeight - 20) {
      doc.addPage()
      yOffset = 10
    }
  }

  const date = new Date()
  let formattedDateTime = date.toISOString()
  const formattedDate = formattedDateTime.substring(0, 10)
  const formattedTime = formattedDateTime.substring(11, 19)
  const filename = `Favorites-[${formattedDate}-${formattedTime}].pdf`
  doc.save(filename)
}
const previewFavoritesPDF = async (favorites) => {
  if (!favorites || Object.keys(favorites).length === 0) {
    toast("No favorites found", {
      icon: "🙈",
      style: {
        background: "#18181b",
      },
    })
    return
  }
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })
  let yOffset = 10
  const lineHeight = 10 // Adjust line height as needed
  const pageHeight = doc.internal.pageSize.height

  for (const [recipeName, { link, image }] of Object.entries(favorites)) {
    // Embed image if available
    if (image) {
      try {
        const imgData = await downloadAndEmbedImage(image)
        if (imgData) {
          // Add image at current yOffset
          doc.addImage(imgData, 2, yOffset, 32, 32) // Adjust width and height as needed
          // Increase yOffset for next content
          yOffset += 5 // Adjust vertical spacing between image and title
        } else {
          console.error(`Failed to embed image for ${recipeName}`)
        }
      } catch (error) {
        console.error(`Error embedding image for ${recipeName}:`, error)
      }
    }

    // Style for recipe name
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    const truncatedName = recipeName.substring(0, 40)
    const textLines = doc.splitTextToSize(truncatedName, 100)
    doc.text(textLines, 40, yOffset)

    // Style for link
    doc.setTextColor(0, 0, 255)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    const linkYOffset = yOffset + textLines.length * lineHeight // Place link directly below the recipe name

    const maxLinkLength = 60
    const truncatedLink =
      link.length > maxLinkLength
        ? link.substring(0, maxLinkLength) + "..."
        : link
    doc.textWithLink(truncatedLink, 40, linkYOffset, { url: link })

    yOffset += (textLines.length + 1) * lineHeight // Adjust yOffset to move to the next content

    if (yOffset > pageHeight - 20) {
      doc.addPage()
      yOffset = 10
    }
  }

  const pdfBlob = doc.output("blob")
  return URL.createObjectURL(pdfBlob)
}

const RecipesMenu = ({ searchResults, favorites, removeFromFavorites }) => {
  const [isLoadingPdfPreview, setIsLoadingPdfPreview] = useState(false)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleDownloadPDF = async () => {
    try {
      setIsLoadingPdf(true)
      await downloadFavoritesPDF(favorites)
      toast("Your download is ready!", {
        icon: "🎉",
        duration: 5000,
        style: {
          background: "#18181b",
        },
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingPdf(false)
    }
  }

  const handlePreviewPDF = async () => {
    setIsLoadingPdfPreview(true)

    try {
      const previewUrl = await previewFavoritesPDF(favorites)
      setPdfPreviewUrl(previewUrl)
      setIsOpen(false)
      toast("Your preview is ready!", {
        icon: "🎉",
        position: "top-center",
        duration: 1500,
        style: {
          background: "#2b2b2b",
        },
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingPdfPreview(false)
    }
  }

  const handleClosePreview = () => {
    setPdfPreviewUrl(null)
  }

  return (
    <div className="mx-6 flex h-12 items-center justify-between text-sm opacity-100 transition-opacity duration-100 md:mx-20">
      {searchResults.count > 0 && (
        <>
          <Badge variant={"outline"} className="p-2">
            <b>{searchResults.count}</b> results
          </Badge>
          {isLoadingPdfPreview && (
            <div className="absolute left-6">
              <Loader2 className="w-10 animate-spin" />
            </div>
          )}
        </>
      )}
      {pdfPreviewUrl && (
        <PDFViewer inputFile={pdfPreviewUrl} onClose={handleClosePreview} />
      )}
      <div className="grow-0"></div>
      <FavoritesSheet setOpen={setIsOpen} isOpen={isOpen}>
        {Object.keys(favorites).length > 0 ? (
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button
              variant={"moon"}
              onClick={handlePreviewPDF}
              className="relative flex gap-2 p-2 "
              size={"sm"}
            >
              <File className="left-2 w-5 md:w-6" />

              <div className="line-clamp-1 items-center text-sm md:text-lg lg:text-lg">
                Preview favorites.pdf{" "}
              </div>
              {isLoadingPdfPreview && (
                <Loader2 className="absolute right-0 w-6 animate-spin" />
              )}
            </Button>
            <Button
              variant={"moon"}
              onClick={handleDownloadPDF}
              className="relative gap-2 p-2 "
              size={"sm"}
            >
              <Download className="left-2 w-5 md:w-6" />
              <div className="line-clamp-1 items-center text-sm md:text-lg lg:text-lg">
                Download favorites.pdf
              </div>
              {isLoadingPdf && (
                <Loader2 className="absolute right-0 w-6 animate-spin" />
              )}
            </Button>
          </div>
        ) : (
          <div className="flex justify-center ">
            Get started by favoriting something!
          </div>
        )}
        <div className="flex h-[90%] flex-col overflow-auto rounded-md">
          <div className="pb-[10vh] pt-2">
            {Object.entries(favorites).map(([recipeName, { link, image }]) => (
              <Link
                target="_blank"
                href={link}
                key={recipeName}
                className="flex items-center justify-between gap-2 border-t px-1 py-2 transition duration-150 ease-in-out hover:bg-zinc-900/70 hover:underline"
                style={{ textDecoration: "none" }}
              >
                {image && (
                  <Image
                    src={image}
                    width={42}
                    height={42}
                    alt={recipeName}
                    className="rounded-full"
                    unoptimized
                    priority
                  />
                )}
                <div className="flex w-full select-none items-center justify-between gap-2 transition-all duration-150 hover:text-moon">
                  <span className="line-clamp-3 rounded-md decoration-moon hover:shadow-inner">
                    {recipeName}
                  </span>
                  <button
                    className="p-2 text-red-600 hover:scale-125 hover:text-red-700"
                    onClick={(e) => {
                      e.preventDefault()
                      removeFromFavorites(recipeName)
                    }}
                  >
                    <Trash2Icon size={18} />
                    <Separator className="bg-red-900 text-red-500" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </FavoritesSheet>
    </div>
  )
}

export default RecipesMenu
