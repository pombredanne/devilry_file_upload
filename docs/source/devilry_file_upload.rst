======================
devilry_file_upload.js
======================

.. default-domain:: js
.. highlight:: js



This module defines the global ``devilry_file_upload`` namespace with classes
and functions that makes it easy to implement file upload widgets that works in
old browsers, and at the same time makes full use of the HTML5 File API.


.. note::

    The code is developed using CoffeeScript. We provide the compiled
    JavaScript, so you do not have to know CoffeeScript to use the library.
    When we talk about classes, we are talking about coffeescript classes,
    which you can extend in both CoffeeScript and JavaScript. Refer to
    the `CoffeeScript docs <http://coffeescript.org/#classes>`_ for more info.



class FileUpload
================

Provides the basics required for any file-upload implementation:

- Events for tracking the progress.
- Upload with XMLHttpRequest if supported.
- Fallback to hidden IFrame upload for older browsers (IE8 and IE9).

How it works
------------
You specify a container and widget rendering function as an option to the
constructor. A widget is the UI (form, fields and other elements) that the user
uses to upload files. When a file is uploaded, its widget is hidden, and a new
widget is added to the container.  When the upload is complete, the (hidden)
widget is removed. With this method, we can upload many files in parallel, even
on old browsers using hidden iframes. If we did not have to use iframe upload
for older browsers, a single widget would have been enough.


How the file upload is performed
--------------------------------

If the browser support XMLHttpRequest:

    - Get the URL from the forms ``action`` attribute.
    - Get the files from the files-attribute of the file field.
    - Create a FormData object containing all the files selected in the file
      field (yes, we support multiple file upload).
    - Submit this to the server.

If the browser does not support XMLHttpRequest:

    - Create a hidden iframe with ID and name.
    - Set the target-attribute of the form to the ID/name of the iframe.
    - Submit the form.
    - Listen for the load-event on the iframe.

The file upload is handled by :class:`devilry_file_upload.AsyncFileUploader`.

How we handle errors
--------------------
The server implementation should always:

- respond with ``200 OK``. This is because we have no way of handling other status
  codes in an IFrame, and IE shows its own error pages if we respond with short
  messages and other status codes than 200 (ref: http://stackoverflow.com/questions/11544048/how-to-suppress-friendly-error-messages-in-internet-explorer).
- respond with content type ``text/html``. This is because content-types like
  ``application/json`` does not work with IE and IFrames, and ``text/plain`` is
  wrapped in a ``<pre>``-tag by several browsers when it is displayed in an
  IFrame.

The server implementation should respond with some kind of data that you
can decode to determine if the response was successful or not. Our examples
uses JSON data and a boolean ``successful``-attribute.


API
---

.. class:: devilry_file_upload.FileUpload(options)

    :param options: Object with the following attributes:

        containerElement  (*required*)
            The HTML element where we will append the widgets.

        widgetRenderFunction (*required*)
            A function that renders a widget. A widget must contain a form with  a
            file field.

        uploadOnChange (defaults to ``true``)
            If this is ``true``, we upload as soon as the file field changes, or when a
            file is dragged and dropped. Set this to ``false`` to handle uploading
            yourself.


.. function:: devilry_file_upload.FileUpload.getContainerElement

    Get the container HTML element. This is the element provided as an option.
    Contains the current widget (see
    :func:`~devilry_file_upload.FileUpload.getCurrentWidgetElement`), and any
    other widgets that are hidden while their files are beeing uploaded.

.. function:: devilry_file_upload.FileUpload.getCurrentWidgetElement

    Get the currently visible widget. Each time a file is uploaded, the current
    widget is hidden, and a new widget is appended to the container (see
    ``@getContainerElement()``). When the upload is complete, its widget is destroyed.

    The format of each widget is specified through the ``widgetRenderFunction``
    option for the constructor.

.. function:: devilry_file_upload.FileUpload.getCurrentFormElement

    Get the first form element within
    :func:`~devilry_file_upload.FileUpload.getCurrentWidgetElement`. The widget
    should only contain one form, so this should return the current form.

.. function:: devilry_file_upload.FileUpload.getCurrentFileFieldElement

    Get the first file field element in the current form
    (:func:`~devilry_file_upload.FileUpload.getCurrentFormElement`).  The
    current form  should only contain one file field, so this function should
    return the correct field unless your ``widgetRenderFunction`` renders
    multiple file fields.

.. function:: devilry_file_upload.FileUpload.upload(files)

    If the browser supports XMLHttpRequest file upload, upload the given HTML 5
    File API ``files``. If not, upload the file in the current file field (see
    :func:`~devilry_file_upload.FileUpload.getCurrentFileFieldElement`). As
    soon as the upload starts, we hide the current widget and create a new one.
    When the upload is complete, we destroy the old hidden widget.
    
    This is used internally to upload files whenever the filefield value
    changes, and when the user drops files into the browser using drag and
    drop. If you set the ``uploadOnChange`` option to ``false``, you will
    probably want to call this function manually.

.. function:: devilry_file_upload.FileUpload.pause()

    Pause the FileUpload. While paused, calling
    :func:`~devilry_file_upload.FileUpload.upload` will raise an exception.

.. function:: devilry_file_upload.FileUpload.resume()

    Resume the file upload after a :func:`~devilry_file_upload.FileUpload.pause`.


Events
------
The ``fileUpload`` argument of the events is the FileUpload instance that fired
the event.

``createWidget(fileUpload)``
    Fired whenever we create a new widget. See
    :func:`devilry_file_upload.FileUpload.upload` for more info.
``fieldChange(fileUpload)``
    Fired whenever the value of the current file field changes.
``uploadStart(fileUpload, asyncFileUploader)``
    Fired whenever an upload is started. The ``asyncFileUploader`` is the
    :class:`devilry_file_upload.AsyncFileUploader` instance that triggered the
    event. Use ``asyncFileUploader.on()`` (see :func:`devilry_file_upload.Observable.on`)
    to listen to events on the ``asyncFileUploader``.

    The upload is cancelled if any of the listeners return a
    :class:`devilry_file_upload.ObservableResult` with ``abort=true``. Example::

        function onUploadStart() {
            return new devilry_file_upload.ObservableResult({
                abort: true
            });
        }

``pause(fileUpload)``
    Fired when the :func:`devilry_file_upload.FileUpload.pause` function is
    called.

``resume(fileUpload)``
    Fired when the :func:`devilry_file_upload.FileUpload.resume` function is
    called.



class AsyncFileUploader
=======================

.. class:: devilry_file_upload.AsyncFileUploader(options)

    Makes it easy to upload files with one of XMLHttpRequest or hidden Iframe.
    Abstracts away most of the differences between the two methods of file
    upload, while still making the information from the new File API available.

    :param options: Object with the following attributes:

        files (*required*)
            Array of HTML5 File API files. Typically from ``filefield.files``
            or ``dropevent.dataTransfer.files``.

        formElement
            The HTML element for the form that we use to upload the file if
            using IFrame upload. For XMLHttpRequest upload, we use the ``action``
            attribute of this form as the upload URL.

            .. warning::
                
                We change the ``target``-attribute of the form in
                :func:`~devilry_file_upload.AsyncFileUploader.uploadHiddenIframeForm`.

        formFieldName
            The name of the file input field.


.. function:: devilry_file_upload.AsyncFileUploader.uploadXHR

    Upload the files using XMLHttpRequest. You normally use 

.. function:: devilry_file_upload.AsyncFileUploader.uploadHiddenIframeForm

    Upload the file (iframe upload only supports one file at a time) using
    the ``formElement``. We create a hidden IFrame, and set the
    ``target``-attribute of the form to that iframe. Then we listen for the load
    event on the iframe, and uses the body of the iframe as the response data.

.. function:: devilry_file_upload.AsyncFileUploader.upload

    Upload using XMLHttpRequest if available, or using an old-fasioned form in
    an hidden iframe if XMLHttpRequest is not available. Uses
    :func:`devilry_file_upload.BrowserInfo.supportsXhrFileUpload`.

.. function:: devilry_file_upload.AsyncFileUploader.abort
    Abort the upload. Does nothing on old browsers where we use iFrame upload.

    Use :func:`devilry_file_upload.BrowserInfo.supportsXhrFileUpload` to
    determine if you should support abort in your UI.

.. function:: devilry_file_upload.AsyncFileUploader.getFilenames

    Get the name of all the files as a array of strings.

    For new browsers, this uses ``@files``, and for old browsers, this parses
    the value of the input field.

.. function:: devilry_file_upload.AsyncFileUploader.hasMultipleFiles

    Returns ``true`` if we are uploading multiple files.

.. function:: devilry_file_upload.AsyncFileUploader.getFileInfo

    Get the ``name``, ``size`` and ``type`` of all the files.

    Returns an array where each item is an object with the following attributes:

        name
            The name of the file.
        size
            The size of the file in bytes. ``undefined`` for older browsers
            that does not support the File-API.
        type
            The content-type of the file as a string. ``undefined`` for older
            browsers that does not support the File-API.

.. function:: devilry_file_upload.AsyncFileUploader.getFileobjectsByName

    Get the HTML File API File-objects as an object with filename as the attribute name.

    For older browsers, that does not support the file-API, this will return an
    empty object.


Events
------
AsyncFileUploader is a subclass of :class:`devilry_file_upload.Observable`.
The ``asyncFileUploader`` argument of the events is the AsyncFileUploader
instance that fired the event.


``start(asyncFileUploader)``
    Fired before the upload starts.

    The upload is cancelled if any of the listeners return a
    :class:`devilry_file_upload.ObservableResult` with ``abort=true``. Example::

        function onStart() {
            return new devilry_file_upload.ObservableResult({
                abort: true
            });
        }

``progress(asyncFileUploader, state, e)``
    Fired for each progress. The ``state`` is a float between 0 and 100
    indicating the progress of the upload in percent. Only fired by browsers
    supporting XMLHttpRequest, and it is not always fired when uploading small
    files. The ``e`` argument is the event-object from the
    XMLHttpRequest event.
``abort(asyncFileUploader, e)``
    Fired when the upload is aborted. If you allow your users to abort, you
    need to handle partial uploads on the server. Some do this simply by
    keeping files and allowing them to be overwritten, while another solution
    is to use an API to delete the file on abort. Only fired on browsers
    supporting XMLHttpRequest. The ``e`` argument is the event-object from the
    XMLHttpRequest event.
``error(asyncFileUploader, e)``
    Fired when the upload fails. Only fired on browsers supporting
    XMLHttpRequest. Since the server API should be using HTTP 200 status code
    for errors to be compatible with older browsers, this event should only be
    triggered on connectivity errors.
    The ``e`` argument is the event-object from the XMLHttpRequest event.
``finished(asyncFileUploader, data)``
    Fired when the upload is finished. The ``data`` is a string with whatever
    your server implementation responds with. You will have to decode the data
    yourself.



class DragAndDropFiles
======================

.. class:: devilry_file_upload.DragAndDropFiles(options)

    A simple observable making drag and drop of files events on an object
    available to you.

    :param options: Object with the following attributes:

        dropTargetElement (*required*)
            The HTML element to attach the drag and drop events to.

.. attribute:: devilry_file_upload.DragAndDropFiles.dropTargetElement

    The ``dropTargetElement`` that was sent in as an option.

Events
------
DragAndDropFiles is a subclass of :class:`devilry_file_upload.Observable`. The
``dragAndDrop`` argument is the DragAndDropFiles-object that fired the event.

``dragover(dragAndDrop, e)``
    Fired whenever files are dragged over the drag and drop target. ``e`` is
    the drag event object.
``dragenter(dragAndDrop, e)``
    Fired whenever files are dragged into the drag and drop target. ``e`` is
    the drag event object.
``dragleave(dragAndDrop, e)``
    Fired whenever files are dragged out of the drag and drop target. ``e`` is
    the drag event object.
``dropfiles(dragAndDrop, files, e)``
    Fired whenever files are dropped in the drag and drop target. ``files`` is
    a list of File API File-objects (``e.dataTransfer.files``). ``e`` is the
    drag event object.



class FileWrapper
=================

.. class:: devilry_file_upload.FileWrapper(file)

    Helper functions for the HTML5 File object.

    :param file: A HTML File API File object.

    .. function:: isImage

        Return ``true`` if the ``type`` of the file is one of: ``image/png``, ``image/jpeg`` or ``image/png``.

    .. function:: isText

        Return ``true`` if the ``type`` of the file is ``text/plain``.



function prevent_default_window_drophandler
===========================================
.. function:: devilry_file_upload.prevent_default_window_drophandler()

Prevent the default drop handler on the window. That handler usually shows the
file in the browser, which navigates away from the current page.






class BrowserInfo and the browserInfo attribute
===============================================

.. class:: devilry_file_upload.BrowserInfo

    Provides information about the capabilities of the browser.

    Not available directly, but an instance of the class is available as
    :attr:`devilry_file_upload.browserInfo`.

.. function:: devilry_file_upload.BrowserInfo.supportsDragAndDropFileUpload()

    Returns ``true`` if the browser supports file upload through drag and drop.

.. function:: devilry_file_upload.BrowserInfo.supportsXhrFileUpload()

    Returns ``true`` if the browser supports ``XMLHttpRequest`` file upload.
        

.. attribute:: devilry_file_upload.browserInfo()

    An instance of :class:`devilry_file_upload.BrowserInfo`.


 

class Observable
================

.. class:: devilry_file_upload.Observable

    Base class for classes that can fire events. Other classes can listen to
    events fired by Observable classes.
    

.. function:: devilry_file_upload.Observable.on(name, callback)

    Add a listener for the event given by ``name``. When the event is
    fired/triggered, this callback is invoked.

.. function:: devilry_file_upload.Observable.off(name, callback)

    Remove a listener added with :func:`~devilry_file_upload.Observable.on`.

.. function:: devilry_file_upload.Observable.fireEvent(name, args...)

    Fire/trigger an event. All listeners registered with
    :func:`~devilry_file_upload.Observable.on` is invoked in the order they
    where added.

    A listener may return a :class:`devilry_file_upload.ObservableResult` object.
    If the ObservableResult has ``abort`` set to ``true``, processing after
    this event should be aborted. Observables using this feature should use
    something like this::

        abort = fireEvent('myevent')
        if(!abort) {
            ...
        }

    Most events do not support abort --- events using abort includes
    documentation for aborting.

    If the ObservableResult object has ``remove`` set to ``true``, the
    listener will be removed after all handlers for that event has
    completed. This is needed when you want to run
    :func:`~devilry_file_upload.Observable.off` on a function within
    itself, because removing the function would change the event listener
    array while fireEvent is looping through it.


class ObservableResult
======================

.. class:: devilry_file_upload.ObservableResult(options)

    May be returned by event listeners to trigger special behaviors.
    See :class:`devilry_file_upload.Observable` for more info about
    ObservableResult.

    :param options: An object with the following attributes:

        remove (defaults to ``false``)
            If this is ``true``, the listener listener will be removed at the
            end of the current fireEvent loop.
        abort (defaults to ``false``)
            If this is ``true``, the Observable calling ``fireEvent`` may
            choose to stop its current action. This is up to the Observable,
            and should be documented for any event using the feature.

function applyOptions
=====================

.. function:: devilry_file_upload.applyOptions(classorfunctionname, options, defaults, required)

    :param classorfunctionname:
        The name of the class or function. Used in the message when a required
        is not present.
    :param options:
        The provided options object.
    :param defaults:
        Default values if any of the options are ``null`` or ``undefined``.
    :param required:
        Array of required options.
    :return:
        An object with the result of copying ``options``, then appling the
        ``defaults`` for all ``undefined`` or ``null`` values.

    Throws an exception if required arguments are missing.
