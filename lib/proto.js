/**
 * Created by Administrator on 2014/9/13.
 */
function openwin(content)
{
    var OpenWindow=window.open("", "newwin", "height=760, width=1280,toolbar=no,scrollbars=scroll,menubar=no");
    OpenWindow.document.write(content);
    OpenWindow.document.close()
}